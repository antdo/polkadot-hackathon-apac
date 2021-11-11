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
    #[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
    pub enum PaymentStatus {
        WaitingForDeposit,
        Deposited,
        Completed,
        Disputed,
    }

    #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo)]
    #[scale_info(skip_type_params(T))]
    pub struct Payment<T: Config> {
        pub order: u128,
        pub name: Vec<u8>,
        pub description: Vec<u8>,
        pub amount: BalanceOf<T>,
        pub payer: AccountOf<T>,
        pub payee: AccountOf<T>,
        pub status: PaymentStatus,
        pub fund_lock_id: LockIdentifier,
    }

    #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo)]
    #[scale_info(skip_type_params(T))]
    #[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
    pub enum ResolverStatus {
        New,
        Active,
    }

    #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo)]
    #[scale_info(skip_type_params(T))]
    pub struct Resolver<T: Config> {
        pub account: AccountOf<T>,
        pub name: Vec<u8>,
        pub detail: Vec<u8>,
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
    }

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        PaymentCreated(T::AccountId, T::Hash),
        PaymentDeposited(T::AccountId, T::Hash),
        PaymentCompleted(T::AccountId, T::Hash),
        PaymentDisputed(T::AccountId, T::Hash),
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
            payer: AccountOf<T>,
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
                status: PaymentStatus::New,
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

            let payment = Self::payments(&payment_id).ok_or(<Error<T>>::PaymentNotExist)?;

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

            Self::deposit_event(Event::PaymentDeposited(payer, payment_id));
            Ok(())
        }

        #[pallet::weight(100)]
        pub fn complete_payment(origin: OriginFor<T>, payment_id: T::Hash) -> DispatchResult {
            let payer = ensure_signed(origin)?;

            let payment = Self::payments(&payment_id).ok_or(<Error<T>>::PaymentNotExist)?;

            let amount = payment.amount.clone();
            let payee = payment.payee.clone();

            T::Currency::remove_lock(payment.fund_lock_id.clone(), &payer);

            T::Currency::transfer(&payer, &payee, amount, ExistenceRequirement::KeepAlive)?;

            Self::deposit_event(Event::PaymentCompleted(payer, payment_id));
            Ok(())
        }

        #[pallet::weight(100)]
        pub fn dispute_payment(origin: OriginFor<T>, payment_id: T::Hash) -> DispatchResult {
            let payer = ensure_signed(origin)?;

            Self::deposit_event(Event::PaymentDisputed(payer, payment_id));
            Ok(())
        }

        #[pallet::weight(100)]
        pub fn apply_to_be_resolver(origin: OriginFor<T>) -> DispatchResult {
            Ok(())
        }

        #[pallet::weight(100)]
        pub fn vote_for_resolver_candidate(origin: OriginFor<T>) -> DispatchResult {
            Ok(())
        }
    }

    impl<T: Config> Pallet<T> {}
}
