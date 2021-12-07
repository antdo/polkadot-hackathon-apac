#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[frame_support::pallet]
pub mod pallet {
    use frame_support::{
        dispatch::DispatchResult,
        pallet_prelude::*,
        sp_runtime::traits::Hash,
        sp_std::if_std,
        sp_std::vec::Vec,
        traits::{
            Currency, ExistenceRequirement, Get, LockIdentifier, LockableCurrency, Randomness,
            WithdrawReasons,
        },
        transactional,
    };
    use frame_system::pallet_prelude::*;
    use scale_info::TypeInfo;

    #[cfg(feature = "std")]
    use serde::{Deserialize, Serialize};

    type AccountOf<T> = <T as frame_system::Config>::AccountId;
    type BalanceOf<T> =
        <<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;

    #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo)]
    #[scale_info(skip_type_params(T))]
    pub struct Image {
        pub proof: Vec<u8>,
        pub url: Vec<u8>,
    }

    #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo)]
    #[scale_info(skip_type_params(T))]
    #[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
    pub enum PaymentStatus {
        WaitingForDeposit,
        Deposited,
        Completed,
        Cancelled,
        Disputed,
    }

    #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo)]
    #[scale_info(skip_type_params(T))]
    pub struct Payment<T: Config> {
        pub order: u128,
        pub name: Vec<u8>,
        pub description: Vec<u8>,
        pub images: Vec<Image>,
        pub amount: BalanceOf<T>,
        pub payer: Option<AccountOf<T>>,
        pub payee: AccountOf<T>,
        pub status: PaymentStatus,
        pub fund_lock_id: LockIdentifier,
    }

    #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo)]
    #[scale_info(skip_type_params(T))]
    #[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
    pub enum ResolverStatus {
        Canditate,
        Active,
        Banned,
    }

    #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo)]
    #[scale_info(skip_type_params(T))]
    pub struct Resolver<T: Config> {
        pub account: AccountOf<T>,
        pub name: Vec<u8>,
        pub application: Vec<u8>,
        pub staked: BalanceOf<T>,
        pub delegators: Vec<ResolverDelegator<T>>,
        pub status: ResolverStatus,
    }

    #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo)]
    #[scale_info(skip_type_params(T))]
    pub struct ResolverDelegator<T: Config> {
        pub account: AccountOf<T>,
        pub amount: BalanceOf<T>,
    }

    #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo)]
    #[scale_info(skip_type_params(T))]
    #[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
    pub enum DisputeStatus {
        Processing,
        Resolved,
        Escalated,
    }

    #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo)]
    #[scale_info(skip_type_params(T))]
    pub struct DisputeProof<T: Config> {
        pub provider: AccountOf<T>,
        pub description: Vec<u8>,
        pub images: Vec<Image>,
    }

    #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo)]
    #[scale_info(skip_type_params(T))]
    pub struct Dispute<T: Config> {
        pub reason: Vec<u8>,
        pub issuer: AccountOf<T>,
        pub payer: AccountOf<T>,
        pub payee: AccountOf<T>,
        pub resolver: Resolver<T>,
        pub payment_id: T::Hash,
        pub proofs: Vec<DisputeProof<T>>,
        pub status: DisputeStatus,
    }

    #[pallet::pallet]
    #[pallet::generate_store(trait Store)]
    pub struct Pallet<T>(_);

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type Event: From<Event<Self>> + IsType<<Self as frame_system::Config>::Event>;
        type Currency: LockableCurrency<Self::AccountId, Moment = Self::BlockNumber>;
        type ResolverRandomness: Randomness<Self::Hash, Self::BlockNumber>;

        #[pallet::constant]
        type ResolverInitialAmount: Get<BalanceOf<Self>>;
        #[pallet::constant]
        type ResolverActiveRequiredAmount: Get<BalanceOf<Self>>;
				#[pallet::constant]
        type FaucetAmount: Get<BalanceOf<Self>>;
    }

    #[pallet::error]
    pub enum Error<T> {
        PaymentNotExist,
        PaymentsCountOverflow,
        NotEnoughBalance,
        AccessDenied,
        ResolverExist,
        ResolverNotExist,
        PayerNotExist,
        DisputeNotExist,
    }

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        PaymentCreated(T::AccountId, T::Hash),
        PaymentDeposited(T::AccountId, T::Hash),
        PaymentCompleted(T::AccountId, T::Hash),
        PaymentDisputed(T::AccountId, T::Hash),
        PaymentCancelled(T::AccountId, T::Hash),
        ResolverCreated(T::AccountId),
        ResolverStaked(T::AccountId, BalanceOf<T>),
        ResolverUnstaked(T::AccountId, BalanceOf<T>),
        DisputeCreated(T::Hash),
        DisputeSolved(T::Hash),
    }

    #[pallet::storage]
    #[pallet::getter(fn all_payments_count)]
    pub(super) type PaymentsCounter<T: Config> = StorageValue<_, u128, ValueQuery>;

    #[pallet::storage]
    #[pallet::getter(fn payments)]
    pub(super) type Payments<T: Config> = StorageMap<_, Twox64Concat, T::Hash, Payment<T>>;

    #[pallet::storage]
    #[pallet::getter(fn payments_owned)]
    pub(super) type PaymentsOwned<T: Config> =
        StorageMap<_, Twox64Concat, T::AccountId, Vec<T::Hash>, ValueQuery>;

    #[pallet::storage]
    #[pallet::getter(fn pay_history)]
    pub(super) type PayHistory<T: Config> =
        StorageMap<_, Twox64Concat, AccountOf<T>, Vec<T::Hash>, ValueQuery>;

    #[pallet::storage]
    #[pallet::getter(fn resolvers)]
    pub(super) type Resolvers<T: Config> = StorageMap<_, Twox64Concat, AccountOf<T>, Resolver<T>>;

    #[pallet::storage]
    #[pallet::getter(fn all_resolvers)]
    pub(super) type AllResolvers<T: Config> = StorageValue<_, Vec<AccountOf<T>>, ValueQuery>;

    #[pallet::storage]
    #[pallet::getter(fn active_resolvers_ids)]
    pub(super) type ActiveResolversIds<T: Config> = StorageValue<_, Vec<AccountOf<T>>, ValueQuery>;

    #[pallet::storage]
    #[pallet::getter(fn disputes)]
    pub(super) type Disputes<T: Config> = StorageMap<_, Twox64Concat, T::Hash, Dispute<T>>;

    #[pallet::storage]
    #[pallet::getter(fn involved_disputes)]
    pub(super) type InvolvedDisputes<T: Config> =
        StorageMap<_, Twox64Concat, AccountOf<T>, Vec<T::Hash>, ValueQuery>;

    #[pallet::storage]
    #[pallet::getter(fn assigned_disputes)]
    pub(super) type AssignedDisputes<T: Config> =
        StorageMap<_, Twox64Concat, AccountOf<T>, Vec<T::Hash>, ValueQuery>;

    #[pallet::genesis_config]
    pub struct GenesisConfig<T: Config> {
        pub resolvers: Vec<(T::AccountId, Vec<u8>, Vec<u8>, ResolverStatus)>,
    }

    // Required to implement default for GenesisConfig.
    #[cfg(feature = "std")]
    impl<T: Config> Default for GenesisConfig<T> {
        fn default() -> GenesisConfig<T> {
            GenesisConfig { resolvers: vec![] }
        }
    }

    #[pallet::genesis_build]
    impl<T: Config> GenesisBuild<T> for GenesisConfig<T> {
        fn build(&self) {}
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::weight(1_000)]
        pub fn create_payment(
            origin: OriginFor<T>,
            name: Vec<u8>,
            description: Vec<u8>,
            amount: BalanceOf<T>,
            payer: Option<AccountOf<T>>,
            images: Vec<Image>,
        ) -> DispatchResult {
            let owner = ensure_signed(origin)?;

            let order = Self::all_payments_count()
                .checked_add(1)
                .ok_or(<Error<T>>::PaymentsCountOverflow)?;

            let payment = Payment::<T> {
                order,
                name,
                description,
                images,
                amount,
                payer,
                payee: owner.clone(),
                status: PaymentStatus::WaitingForDeposit,
                fund_lock_id: *b"lockerid",
            };

            let payment_id = T::Hashing::hash_of(&payment);

            <PaymentsOwned<T>>::mutate(&owner, |payments_vec| payments_vec.push(payment_id));
            <Payments<T>>::insert(&payment_id, payment);
            <PaymentsCounter<T>>::put(order);

            Self::deposit_event(Event::PaymentCreated(owner, payment_id));
            Ok(())
        }

        #[transactional]
        #[pallet::weight(100)]
        pub fn deposit_payment(origin: OriginFor<T>, payment_id: T::Hash) -> DispatchResult {
            let payer = ensure_signed(origin)?;

            let mut payment = Self::payments(&payment_id).ok_or(<Error<T>>::PaymentNotExist)?;

            let amount = payment.amount.clone();

            ensure!(
                T::Currency::free_balance(&payer) >= amount,
                <Error<T>>::NotEnoughBalance
            );

            T::Currency::set_lock(
                payment.fund_lock_id.clone(),
                &payer,
                amount,
                WithdrawReasons::all(),
            );

            payment.status = PaymentStatus::Deposited;
            payment.payer = Some(payer.clone());

            <Payments<T>>::insert(&payment_id, payment);
            <PayHistory<T>>::mutate(&payer, |payment_ids_vec| {
                payment_ids_vec.push(payment_id);
            });

            Self::deposit_event(Event::PaymentDeposited(payer, payment_id));
            Ok(())
        }

        #[pallet::weight(100)]
        pub fn complete_payment(origin: OriginFor<T>, payment_id: T::Hash) -> DispatchResult {
            let payer = ensure_signed(origin)?;

            let mut payment = Self::payments(&payment_id).ok_or(<Error<T>>::PaymentNotExist)?;

            match payment.payer.clone() {
                Some(p) => ensure!(payer == p, <Error<T>>::AccessDenied),
                None => (),
            }

            let amount = payment.amount.clone();
            let payee = payment.payee.clone();

            T::Currency::remove_lock(payment.fund_lock_id.clone(), &payer);

            T::Currency::transfer(&payer, &payee, amount, ExistenceRequirement::KeepAlive)?;

            payment.status = PaymentStatus::Completed;

            <Payments<T>>::insert(&payment_id, payment);

            Self::deposit_event(Event::PaymentCompleted(payer, payment_id));
            Ok(())
        }

        #[pallet::weight(100)]
        pub fn cancel_payment(origin: OriginFor<T>, payment_id: T::Hash) -> DispatchResult {
            let sender = ensure_signed(origin)?;

            let mut payment = Self::payments(&payment_id).ok_or(<Error<T>>::PaymentNotExist)?;

            ensure!(sender == payment.payee, <Error<T>>::AccessDenied);

            if payment.status == PaymentStatus::Deposited {
                let payer = payment.payer.clone();
                match payer {
                    None => (),
                    Some(p) => T::Currency::remove_lock(payment.fund_lock_id.clone(), &p),
                }
            }

            payment.status = PaymentStatus::Cancelled;
            <Payments<T>>::insert(&payment_id, payment);

            Self::deposit_event(Event::PaymentCancelled(sender, payment_id));
            Ok(())
        }

        #[pallet::weight(100)]
        pub fn dispute_payment(
            origin: OriginFor<T>,
            payment_id: T::Hash,
            reason: Vec<u8>,
            description: Vec<u8>,
            images: Vec<Image>,
        ) -> DispatchResult {
            let sender = ensure_signed(origin)?;

            let mut payment = Self::payments(&payment_id).ok_or(<Error<T>>::PaymentNotExist)?;

            let payer = payment.payer.clone().unwrap();

            let is_payment_paticipants = sender == payment.payee || sender == payer;
            ensure!(is_payment_paticipants, <Error<T>>::AccessDenied);

            let resolver = Self::get_resolver().ok_or(<Error<T>>::ResolverNotExist)?;

            let proof = DisputeProof::<T> {
                provider: sender.clone(),
                description,
                images,
            };

            let mut proofs = Vec::new();
            proofs.push(proof);

            let dispute = Dispute::<T> {
                reason,
                issuer: sender.clone(),
                payer: payer.clone(),
                payee: payment.payee.clone(),
                payment_id,
                resolver: resolver.clone(),
                proofs,
                status: DisputeStatus::Processing,
            };

            let dispute_id = T::Hashing::hash_of(&dispute);

            <Disputes<T>>::insert(&dispute_id, dispute);
            <AssignedDisputes<T>>::mutate(&resolver.account, |dispute_ids_vec| {
                dispute_ids_vec.push(dispute_id.clone());
            });

            <InvolvedDisputes<T>>::mutate(&payment.payee, |dispute_ids_vec| {
                dispute_ids_vec.push(dispute_id.clone());
            });

            <InvolvedDisputes<T>>::mutate(&payer, |dispute_ids_vec| {
                dispute_ids_vec.push(dispute_id.clone());
            });

            payment.status = PaymentStatus::Disputed;
            <Payments<T>>::insert(&payment_id, payment.clone());

            Self::deposit_event(Event::PaymentDisputed(sender, payment_id));
            Ok(())
        }

        #[pallet::weight(100)]
        pub fn apply_to_be_resolver(
            origin: OriginFor<T>,
            name: Vec<u8>,
            application: Vec<u8>,
        ) -> DispatchResult {
            let sender = ensure_signed(origin)?;

            ensure!(
                !<Resolvers<T>>::contains_key(&sender),
                <Error<T>>::ResolverExist,
            );

            let initial_staked = T::ResolverInitialAmount::get();

            ensure!(
                T::Currency::free_balance(&sender) >= initial_staked,
                <Error<T>>::NotEnoughBalance
            );

            T::Currency::set_lock(
                *b"resolver",
                &sender,
                initial_staked.clone(),
                WithdrawReasons::all(),
            );

            let resolver = Resolver::<T> {
                account: sender.clone(),
                name,
                application,
                staked: initial_staked.clone(),
                delegators: Vec::new(),
                status: ResolverStatus::Canditate,
            };

            <Resolvers<T>>::insert(&sender, resolver);

            let mut resolvers_ids = Self::all_resolvers();
            resolvers_ids.push(sender.clone());
            <AllResolvers<T>>::set(resolvers_ids);

            Self::deposit_event(Event::ResolverCreated(sender));
            Ok(())
        }

        #[pallet::weight(100)]
        pub fn stake_to_resolver(
            origin: OriginFor<T>,
            resolver_address: AccountOf<T>,
            amount: BalanceOf<T>,
        ) -> DispatchResult {
            let sender = ensure_signed(origin)?;

            ensure!(
                T::Currency::free_balance(&sender) >= amount,
                <Error<T>>::NotEnoughBalance
            );

            let mut resolver =
                Self::resolvers(resolver_address).ok_or(<Error<T>>::ResolverNotExist)?;

            T::Currency::set_lock(
                *b"delegate",
                &sender,
                amount.clone(),
                WithdrawReasons::all(),
            );

            let delegator = ResolverDelegator::<T> {
                account: sender.clone(),
                amount: amount.clone(),
            };

            resolver.delegators.push(delegator);
            resolver.staked = resolver.staked + amount;

            let required_staked = T::ResolverActiveRequiredAmount::get();

            if resolver.staked >= required_staked {
                resolver.status = ResolverStatus::Active;

                let mut resolvers_ids = Self::active_resolvers_ids();
                resolvers_ids.push(resolver.account.clone());
                <ActiveResolversIds<T>>::set(resolvers_ids);
            }

            <Resolvers<T>>::insert(&resolver.account, resolver.clone());

            Self::deposit_event(Event::ResolverStaked(sender, amount));
            Ok(())
        }

        #[pallet::weight(100)]
        pub fn unstake_from_resolver(
            origin: OriginFor<T>,
            resolver_address: AccountOf<T>,
            amount: BalanceOf<T>,
        ) -> DispatchResult {
            let sender = ensure_signed(origin)?;
            Self::deposit_event(Event::ResolverUnstaked(sender, amount));
            Ok(())
        }

        #[pallet::weight(100)]
        pub fn submit_proof(
            origin: OriginFor<T>,
            dispute_id: T::Hash,
            description: Vec<u8>,
            images: Vec<Image>,
        ) -> DispatchResult {
            let provider = ensure_signed(origin)?;

            let mut dispute = Self::disputes(&dispute_id).ok_or(<Error<T>>::DisputeNotExist)?;

            let proof = DisputeProof {
                provider: provider.clone(),
                description,
                images,
            };

            dispute.proofs.push(proof);

            <Disputes<T>>::insert(&dispute_id, dispute);

            Ok(())
        }

        #[pallet::weight(100)]
        pub fn solve_dispute(
            origin: OriginFor<T>,
            dispute_id: T::Hash,
            winner: AccountOf<T>,
        ) -> DispatchResult {
            let sender = ensure_signed(origin)?;

            let mut dispute = Self::disputes(dispute_id).ok_or(<Error<T>>::DisputeNotExist)?;

            ensure!(sender == dispute.resolver.account, <Error<T>>::AccessDenied);

            let payment = Self::payments(&dispute.payment_id).ok_or(<Error<T>>::DisputeNotExist)?;

            if winner == dispute.payer {
                T::Currency::remove_lock(*b"lockerid", &dispute.payer);
            } else {
                T::Currency::remove_lock(*b"lockerid", &dispute.payer);
                T::Currency::transfer(&dispute.payer, &dispute.payee, payment.amount.clone(), ExistenceRequirement::KeepAlive)?;
            }

            dispute.status = DisputeStatus::Resolved;

            <Disputes<T>>::insert(&dispute_id, dispute);

            Self::deposit_event(Event::DisputeSolved(dispute_id));
            Ok(())
        }

				#[pallet::weight((0, DispatchClass::Normal, Pays::No))]
				pub fn faucet(origin: OriginFor<T>) -> DispatchResult {
					let sender = ensure_signed(origin)?;
					T::Currency::deposit_creating(&sender, T::FaucetAmount::get());
					Ok(())
				}
    }

    impl<T: Config> Pallet<T> {
        pub fn get_resolver() -> Option<Resolver<T>> {
            let random = T::ResolverRandomness::random(&b"generate_resolver"[..])
                .0
                .as_ref()
                .to_vec();

            let active_resolvers_count = Self::active_resolvers_ids().len();

            let random_num = usize::from(random[0]) % active_resolvers_count;

            let account = Self::active_resolvers_ids()[random_num].clone();

            if_std! {
                println!("Number of resolver: {}", &active_resolvers_count);
                println!("Random num: {}", &random_num);
                println!("Selected account: {}", &account);
            }

            let resolver = Self::resolvers(&account);

            resolver
        }
    }
}
