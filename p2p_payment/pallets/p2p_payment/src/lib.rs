#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[frame_support::pallet]
pub mod pallet {
    use frame_support::pallet_prelude::*;
    use frame_support::{
        sp_runtime::traits::Hash,
        traits::{tokens::ExistenceRequirement, Currency, Randomness},
        transactional,
    };
    use frame_system::pallet_prelude::*;
    use uuid::Uuid;

    type AccountOf<T> = <T as frame_system::Config>::AccountId;
    type BalanceOf<T> =
        <<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;

    pub enum PaymentStatus {
        New,
        Deposited,
        Completed,
    }

    pub struct Payment<T: Config> {
        pub id: uint32,
        pub title: String,
        pub description: String,
        pub amount: BalanceOf<T>,
        pub payer: AccountOf<T>,
        pub payee: AccountOf<T>,
    }

    pub enum ResolverStatus {
        New,
        Active,
    }

    pub struct Resolver<T: Config> {
        pub account: AccountOf<T>,
        pub name: String,
        pub detail: String,
        pub staked: BalanceOf<T>,
        pub status: ResolverStatus,
    }

    #[pallet::storage]
    #[pallet::getter(fn payments)]
    pub(super) type Payments<T: Config> = StorageMap<_, Twox64Concat, T::Hash, Payment<T>>;

    #[pallet::storage]
    #[pallet::getter(fn resolvers)]
    pub(super) type Resolvers<T: Config> = StorageMap<_, Twox64Concat, T::Hash, Payment<T>>;

    #[pallet::storage]
    #[pallet::getter(fn payments_owned)]
    pub(super) type PaymentsOwned<T: Config> =
        StorageMap<_, Twox64Concat, T::AccountId, Vec<String>, ValueQuery>;

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type Event: From<Event<Self>> + IsType<<Self as frame_system::Config>::Event>;
        type Currency: Currency<Self::AccountId>;
    }

    // Events.
    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        PaymentCreated(T::AccountId, T::Hash),
        PaymentDeposited(T::AccountId, T::Hash, Option<BalanceOf<T>>),
        PaymentCompleted(T::AccountId, T::AccountId, T::Hash),
        PaymentDisputed(T::AccountId, T::AccountId, T::Hash),
    }

    // Errors.
    #[pallet::error]
    pub enum Error<T> {}

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::weight(100)]
        pub fn create_payment(
            origin: OriginFor<T>,
            name: String,
            description: String,
            amount: BalanceOf<T>,
            payer: AccountOf<T>,
        ) -> DispatchResult {
            let sender = ensure_signed(origin)?;

            let id = Uuid::new_v4().to_string();

            let payment = Payment::<T> {
                id,
                name,
                description,
                amount,
                payer,
                payee: sender,
            };

            <PaymentsOwned<T>>::mutate(&sender, |payments_vec| payments_vec.push(id));
            <Payments<T>>::insert(payment);

            Self::deposit_event(Event::PaymentCreated(sender, id));
            Ok(())
        }

        #[pallet::weight(100)]
        pub fn deposit_payment(origin: OriginFor<T>, payment_id: String) -> DispatchResult {
            let sender = ensure_signed(origin)?;

            Self::deposit_event(Event::PaymentDeposited(sender, payment_id));
            Ok(())
        }

        #[pallet::weight(100)]
        pub fn complete_payment(origin: OriginFor<T>) -> DispatchResult {
            Self::deposit_event(Event::PaymentCompleted(sender, payment_id));
            Ok(())
        }

        #[pallet::weight(100)]
        pub fn dispute_payment(origin: OriginFor<T>) -> DispatchResult {
            Self::deposit_event(Event::PaymentDisputed(sender, payment_id));
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
