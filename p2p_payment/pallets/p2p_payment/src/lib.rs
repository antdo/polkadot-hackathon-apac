#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[frame_support::pallet]
pub mod pallet {
    use frame_support::{
        dispatch::DispatchResult,
        pallet_prelude::*,
        sp_runtime::traits::Hash,
        sp_std::vec::Vec,
        traits::{
            Currency, ExistenceRequirement, LockIdentifier, LockableCurrency, Randomness,
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
    pub struct Image<T: Config> {
        pub hash: T::Hash,
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
        pub images: Vec<Image>,
        pub description: Vec<u8>,
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
        pub status: ResolverStatus,
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
        pub images
    }

    #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo)]
    #[scale_info(skip_type_params(T))]
    pub struct DisputeProposal<T: Config> {
        pub issuer: AccountOf<T>,
        pub buyer: AccountOf<T>,
        pub seller: AccountOf<T>,
        proof
        pub application: Vec<u8>,
        pub staked: BalanceOf<T>,
        pub status: ResolverStatus,
    }

    #[pallet::pallet]
    #[pallet::generate_store(trait Store)]
    pub struct Pallet<T>(_);

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type Event: From<Event<Self>> + IsType<<Self as frame_system::Config>::Event>;
        type Currency: LockableCurrency<Self::AccountId, Moment = Self::BlockNumber>;
    }

    #[pallet::error]
    pub enum Error<T> {
        PaymentNotExist,
        PaymentsCountOverflow,
        NotEnoughBalance,
        AccessDenied,
    }

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        PaymentCreated(T::AccountId, T::Hash),
        PaymentDeposited(T::AccountId, T::Hash),
        PaymentCompleted(T::AccountId, T::Hash),
        PaymentDisputed(T::AccountId, T::Hash),
        PaymentCancelled(T::AccountId, T::Hash),
        ResolverCandidateCreated(T::AccountId),
    }

    #[pallet::storage]
    #[pallet::getter(fn all_payments_count)]
    pub(super) type PaymentsCounter<T: Config> = StorageValue<_, u128, ValueQuery>;

    #[pallet::storage]
    #[pallet::getter(fn payments)]
    pub(super) type Payments<T: Config> = StorageMap<_, Twox64Concat, T::Hash, Payment<T>>;

    #[pallet::storage]
    #[pallet::getter(fn resolvers)]
    pub(super) type Resolvers<T: Config> = StorageMap<_, Twox64Concat, T::Hash, Payment<T>>;

    #[pallet::storage]
    #[pallet::getter(fn payments_owned)]
    pub(super) type PaymentsOwned<T: Config> =
        StorageMap<_, Twox64Concat, T::AccountId, Vec<T::Hash>, ValueQuery>;

    #[pallet::storage]
    #[pallet::getter(fn assigned_disputes)]
    pub(super) type PaymentsOwned<T: Config> =
        StorageMap<_, Twox64Concat, T::AccountId, Vec<T::Hash>, ValueQuery>;

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
        ) -> DispatchResult {
            let owner = ensure_signed(origin)?;

            let order = Self::all_payments_count()
                .checked_add(1)
                .ok_or(<Error<T>>::PaymentsCountOverflow)?;

            let payment = Payment::<T> {
                order,
                name,
                description,
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
        pub fn dispute_payment(origin: OriginFor<T>, payment_id: T::Hash) -> DispatchResult {
            let sender = ensure_signed(origin)?;

            let mut payment = Self::payments(&payment_id).ok_or(<Error<T>>::PaymentNotExist)?;

            payment.status = PaymentStatus::Disputed;
            <Payments<T>>::insert(&payment_id, payment);

            Self::deposit_event(Event::PaymentDisputed(sender, payment_id));
            Ok(())
        }

        #[pallet::weight(100)]
        pub fn apply_to_be_resolver(origin: OriginFor<T>) -> DispatchResult {
            let sender = ensure_signed(origin)?;

            Self::deposit_event(Event::ResolverCreated(sender));
            Ok(())
        }

        #[pallet::weight(100)]
        pub fn vote_for_resolver_candidate(origin: OriginFor<T>) -> DispatchResult {
            Ok(())
        }
    }

    impl<T: Config> Pallet<T> {}
}
