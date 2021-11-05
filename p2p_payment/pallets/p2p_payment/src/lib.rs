#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[frame_support::pallet]
pub mod pallet {
    use frame_support::{
        dispatch::{DispatchResult, DispatchResultWithPostInfo},
        pallet_prelude::*,
        sp_runtime::traits::{Hash, Zero},
        traits::{Currency, ExistenceRequirement, Randomness},
    };
    use frame_system::pallet_prelude::*;
    use scale_info::TypeInfo;
    use uuid::Uuid;

    #[cfg(feature = "std")]
    use serde::{Deserialize, Serialize};

    type AccountOf<T> = <T as frame_system::Config>::AccountId;
    type BalanceOf<T> =
        <<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;

    #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo)]
    #[scale_info(skip_type_params(T))]
    #[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
    pub enum PaymentStatus {
        New,
        Deposited,
        Completed,
    }

    #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo)]
    #[scale_info(skip_type_params(T))]
    pub struct Payment<T: Config> {
        pub id: String,
        pub title: String,
        pub description: String,
        pub amount: BalanceOf<T>,
        pub payer: AccountOf<T>,
        pub payee: AccountOf<T>,
        pub status: PaymentStatus,
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
        pub name: String,
        pub detail: String,
        pub staked: BalanceOf<T>,
        pub status: ResolverStatus,
    }

    #[pallet::pallet]
    #[pallet::generate_store(trait Store)]
    pub struct Pallet<T>(_);

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type Event: From<Event<Self>> + IsType<<Self as frame_system::Config>::Event>;
        type Currency: Currency<Self::AccountId>;
    }

    #[pallet::error]
    pub enum Error<T> {
        // TODO Part III
    }

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        PaymentCreated(T::AccountId, String),
        PaymentDeposited(T::AccountId, String),
        PaymentCompleted(T::AccountId, String),
        PaymentDisputed(T::AccountId, String),
    }

    #[pallet::storage]
    #[pallet::getter(fn payments)]
    pub(super) type Payments<T: Config> = StorageMap<_, Twox64Concat, String, Payment<T>>;

    #[pallet::storage]
    #[pallet::getter(fn resolvers)]
    pub(super) type Resolvers<T: Config> = StorageMap<_, Twox64Concat, String, Payment<T>>;

    #[pallet::storage]
    #[pallet::getter(fn payments_owned)]
    pub(super) type PaymentsOwned<T: Config> =
        StorageMap<_, Twox64Concat, T::AccountId, Vec<String>, ValueQuery>;

    // TODO Part III: Our pallet's genesis configuration.

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::weight(1_000)]
        pub fn create_payment(
            origin: OriginFor<T>,
            title: String,
            description: String,
            amount: BalanceOf<T>,
            payer: AccountOf<T>,
        ) -> DispatchResult {
            let sender = ensure_signed(origin)?;

            let id = Uuid::new_v4().to_string();

            let payment = Payment::<T> {
                id: id.clone(),
                title,
                description,
                amount,
                payer,
                payee: sender.clone(),
                status: PaymentStatus::New,
            };

            <PaymentsOwned<T>>::mutate(&sender, |payments_vec| payments_vec.push(id.clone()));
            <Payments<T>>::insert(&id, payment);

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
        pub fn complete_payment(origin: OriginFor<T>, payment_id: String) -> DispatchResult {
            Self::deposit_event(Event::PaymentCompleted(sender, payment_id));
            Ok(())
        }

        #[pallet::weight(100)]
        pub fn dispute_payment(origin: OriginFor<T>, payment_id: String) -> DispatchResult {
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
