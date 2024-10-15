

module TrusTrain::TrusTrain {
    use aptos_framework::account;
    use std::signer;
    use aptos_framework::resource_account;
    use aptos_framework::coin;
    use aptos_framework::coin::CoinStore;
    use aptos_framework::aptos_coin::AptosCoin;
    use std::option::Option;
    use std::vector::{Self as Vector, empty, push_back};
    use std::debug;
    use std::string::String;
    use aptos_std::simple_map::{Self, SimpleMap};
    use aptos_framework::event;
    //use TrusTrain::FLCoinv2;
    //use TrusTrain::FLCoinv2::FLC;
    use 0x13f383467f9e0bbcd3d9df7ebc720d9273a2a64b97f1de00ca293f7eb0f03344::FLCoinv2;
    use 0x13f383467f9e0bbcd3d9df7ebc720d9273a2a64b97f1de00ca293f7eb0f03344::FLCoinv2::FLC;
    //use std::coin::CoinStore<0x13f383467f9e0bbcd3d9df7ebc720d9273a2a64b97f1de00ca293f7eb0f03344::FLCoinv2::FLC>
    // Errors
    const E_NOT_FOUND: u64 =12121;
    const E_NOT_ALLOWED: u64 =121210;
    const E_ALREADY_INITIALIZED: u64=5;
    const E_NOT_INITIALIZED: u64 = 1;
    const E_RESOURCE_NOT_ENOUGH: u64 = 2;
    const E_INVALID_RESOURCE: u64=3;
    const E_RESOURCE_PROVIDERS_NOT_FOUND: u64 = 404;
    const E_RESOURCE_ACCOUNT_NOT_FOUND: u64 = 0x1001;
    const E_NO_PENDING_REQUESTS_FOR_PROVIDER: u64 = 101;
    const E_NOT_OWNER: u64 = 1001;
    const E_ITEM_NOT_FOUND: u64 = 1002;
    // Consts
    const RESOURCE_ACCOUNT_ADDR: address = @0x5e813ba3119157037e064b59853879ed4f232e69f2e980c108e61b97b72ad96f;
    const TrusTrain_addr: address=@0x13f383467f9e0bbcd3d9df7ebc720d9273a2a64b97f1de00ca293f7eb0f03344;
    struct MyResourceAccount has key {
        signer_cap: account::SignerCapability,
    }
    

    struct ResourceProvider has key, copy,drop, store {
        address: address,
        cpu: vector<u8>,
        gpu: vector<u8>,
        storage: u64,
        storage_description: vector<u8>,
        ram: u64,
        is_external: bool,
    }

    struct TrainingRequest has key, copy,drop , store {
        trainer_address: address,   // Address of the model trainer
        provider_address: address,  // Address of the selected resource provider
        model_ipfs_link: vector<u8>,    // IPFS link to the model subset
        dataset_ipfs_link: vector<u8>,  // IPFS link to the dataset subset
        status: u8,   // 0 = pending, 1 = accepted, 2 = rejected
    }
    struct TrainingRequests has key {
        requests : vector<TrainingRequest>,
    }

    struct ModelWeights has key,store {
        provider_address: address,   // Address of the resource provider
        trainer_address: address,    // Address of the model trainer
        weights_ipfs_link: vector<u8> // IPFS link to the trained model weights
    }
    struct ModelWeightsvector has key{
        models : vector<ModelWeights>,
    }

    struct DatasetInfo has key , store, copy ,drop {
        provider_address: address,
        description: vector<u8>,
        ipfs_link: vector<u8>,
        free: bool,             
        price: u64, 
    }
    struct DatasetsInfo has key {
        datasets : vector<DatasetInfo>,
    }

    // Define an event for accepted requests
    #[event]
    struct TrainingAcceptedEvent has  drop,store {
        trainer_address: address,
        provider_address: address,
        model_ipfs_link: vector<u8>,
        dataset_ipfs_link: vector<u8>,
        message: vector<u8>,
    }
    // Event to be emitted when the model weights are returned by the provider
#[event]
struct ModelWeightsSubmittedEvent has drop, store {
    trainer_address: address,         // Address of the trainer
    provider_address: address,        // Address of the provider
    model_ipfs_link: vector<u8>,      // IPFS link to the model
    dataset_ipfs_link: vector<u8>,    // IPFS link to the dataset
    weights_ipfs_link: vector<u8>,    // IPFS link to the submitted model weights
    message: vector<u8>,              // Custom message for the event (optional)
}
   

    struct Allocation has key {
        cpu: u64,
        gpu: u64,
        model_trainer: address,
        resource_provider: address,
        allocation_time: u64,
        payment_amount: u64,
    }
     public entry fun register_aptos_coin_store(account: &signer) {
        coin::register<AptosCoin>(account);
    }
      // Function to send 1 APT from one address to another
    public entry fun send_one_apt(sender: &signer, receiver: address) {
        let amount: u64 = 1_000_000_00; // 1 APT is represented as 1,000,000 microAPT
        coin::transfer<AptosCoin>(sender, receiver, amount);
    }
    // New struct to hold a list of ResourceProviders
    struct ResourceProviders has key {
        providers: vector<ResourceProvider>,
    }

     fun init_module(resource_account: &signer) {
        // Retrieve the SignerCapability for the resource account
        let signer_cap = resource_account::retrieve_resource_account_cap(resource_account, @0xe3ca9d16389abea14e46e7022010d9f0d03843377c5c53f26616be07fb161bb8);
    
        // Store the SignerCapability within `ModuleData`
        move_to(resource_account, MyResourceAccount {
            signer_cap,
        });

            // Initialize the ResourceProviders struct
        let providers = ResourceProviders {
            providers: Vector::empty(),
        };

        // Move the ResourceProviders struct to the resource account's storage
        move_to(resource_account, providers);
        move_to(resource_account,  TrainingRequests {
        requests: Vector::empty(),
        });

        move_to(resource_account,  DatasetsInfo {
        datasets: Vector::empty(),
        });

        move_to(resource_account,  ModelWeightsvector{
        models : Vector::empty(),
    
        });

    
    }
   
  
    
    // Public function to register resources
public entry fun register_resources(
    account: &signer,
    cpu: vector<u8>,
    gpu: vector<u8>,
    storage: u64,
    storage_description: vector<u8>,
    ram: u64,
    is_external: bool,
) acquires ResourceProviders, MyResourceAccount {
    // Validate input resources (e.g., ensure non-negative values)
    assert!(!Vector::is_empty(&cpu), E_INVALID_RESOURCE);
    assert!(!Vector::is_empty(&gpu), E_INVALID_RESOURCE);
    assert!(!Vector::is_empty(&storage_description), E_INVALID_RESOURCE);
    assert!(ram > 0, E_INVALID_RESOURCE);
    assert!(storage >0, E_INVALID_RESOURCE);

    // Create a new provider object
    let provider = ResourceProvider {
        address: signer::address_of(account),
        cpu: cpu,
        gpu: gpu,
        storage: storage,
        storage_description: storage_description,
        ram: ram,
        is_external: is_external,
    };

    // Borrow the resource account's SignerCapability from MyResourceAccount
    let resource_account = borrow_global<MyResourceAccount>(RESOURCE_ACCOUNT_ADDR);
    let resource_signer = account::create_signer_with_capability(&resource_account.signer_cap);

    // Check if ResourceProviders exists in the resource account
    if (!exists<ResourceProviders>(RESOURCE_ACCOUNT_ADDR)) {
        // Initialize a new ResourceProviders struct and add the provider
        let providers = Vector::empty<ResourceProvider>();
        Vector::push_back(&mut providers, provider);
        move_to(&resource_signer, ResourceProviders { providers });
    } else {
        // If it exists, borrow a mutable reference and add the provider
        let providers_ref = borrow_global_mut<ResourceProviders>(RESOURCE_ACCOUNT_ADDR);
        Vector::push_back(&mut providers_ref.providers, provider);
    }
}


    public entry fun submit_training_request(
    trainer: &signer,
    provider_address: address,
    model_ipfs_link: vector<u8>,
    dataset_ipfs_link: vector<u8>
) acquires TrainingRequests {
    // Create the training request
    let request = TrainingRequest {
        trainer_address: signer::address_of(trainer),
        provider_address: provider_address,
        model_ipfs_link: model_ipfs_link,
        dataset_ipfs_link: dataset_ipfs_link,
        status: 0 // Pending status
    };

    // Save the request to global storage
    let requests = borrow_global_mut<TrainingRequests>(RESOURCE_ACCOUNT_ADDR);
    Vector::push_back(&mut requests.requests, request);

    // Send notification (not part of Move, handled on the frontend)
}



public entry fun handle_training_request(
    provider: &signer,
    request_index: u64,
    accept: bool
) acquires TrainingRequests {
    let requests = borrow_global_mut<TrainingRequests>(RESOURCE_ACCOUNT_ADDR);

    let len = Vector::length(&requests.requests);
    let found = false;

    // Iterate over the requests to find the one matching the provider and is pending
    let i = 0;
    while (i < len) {
        let request = Vector::borrow_mut(&mut requests.requests, i);

        if (request.provider_address == signer::address_of(provider) && request.status == 0) {
            // Request found, update its status based on the acceptance
            if (accept) {
                request.status = 1;  // Accepted
                 let message = vector[
                        89, 111, 117, 114, 32, 116, 114, 97, 105, 110, 105, 110, 103, 32, 114, 101, 113, 117, 101, 115, 116, 32, 104, 97, 115, 32, 98, 101, 101, 110, 32, 97, 99, 99, 101, 112, 116, 101, 100
                    ];  
                 // Emit an event to notify the trainer
                    event::emit(TrainingAcceptedEvent {
                            trainer_address: request.trainer_address,
                            provider_address: request.provider_address,
                            model_ipfs_link: request.model_ipfs_link,
                            dataset_ipfs_link: request.dataset_ipfs_link,
                             message,
                        });
                        
                    
            } else {
                request.status = 2;  // Rejected
                Vector::remove(&mut requests.requests, i);
            };
            found = true;
            break;
        };
        i = i + 1;
    };

    // If no matching request was found, throw an error
    if (!found) {
        abort(E_NO_PENDING_REQUESTS_FOR_PROVIDER);
    };
}
 
public fun get_pending_requests_for_provider(provider: &signer): vector<TrainingRequest> acquires TrainingRequests {
    let provider_address = signer::address_of(provider);
    let requests = borrow_global<TrainingRequests>(RESOURCE_ACCOUNT_ADDR);

    let filtered_requests = Vector::empty<TrainingRequest>();

    // Filter requests for the connected provider
    let len = Vector::length(&requests.requests);
    let i = 0;
    while (i < len) {
        let request = Vector::borrow(&requests.requests, i);
        if (request.provider_address == provider_address && request.status == 0) {  // Pending requests only
            Vector::push_back(&mut filtered_requests, *request);
        };
        i = i + 1;
    };

    filtered_requests
}
public entry  fun shareDataset(
    account: &signer,
    description: vector<u8>,
    ipfs_link: vector<u8>,
    free: bool,
    price: u64
) acquires DatasetsInfo, MyResourceAccount {
    // Create the DatasetInfo struct with the provided description and IPFS link
    let dataset_info = DatasetInfo {
        provider_address: signer::address_of(account),
        description: description,
        ipfs_link: ipfs_link,
        free: free,
        price: price,
    };

    // Retrieve the resource account's SignerCapability from MyResourceAccount
    let my_resource_account = borrow_global<MyResourceAccount>(RESOURCE_ACCOUNT_ADDR);
    let resource_signer = account::create_signer_with_capability(&my_resource_account.signer_cap);

    // Check if the DatasetsInfo exists for the resource account
    if (!exists<DatasetsInfo>(signer::address_of(&resource_signer))) {
        // If it does not exist, create a new vector and add the dataset_info
        let datasets = Vector::empty<DatasetInfo>();
        Vector::push_back(&mut datasets, dataset_info);
        // Store the new DatasetsInfo in the resource account's storage
        move_to(&resource_signer, DatasetsInfo { datasets });
    } else {
        // If it exists, borrow a mutable reference to the datasets vector and add the dataset_info
        let datasets_info = borrow_global_mut<DatasetsInfo>(signer::address_of(&resource_signer));
        Vector::push_back(&mut datasets_info.datasets, dataset_info);
    }

}
// Access dataset function with FLC payment
    public entry fun access_dataset(
        buyer: &signer,
        dataset_index: u64,
        payment_amount: u64
    ) acquires DatasetsInfo {
        let buyer_address = signer::address_of(buyer);
        0x13f383467f9e0bbcd3d9df7ebc720d9273a2a64b97f1de00ca293f7eb0f03344::FLCoinv2::register_coin(buyer);
        // Ensure the dataset exists
        let datasets_info = borrow_global<DatasetsInfo>(RESOURCE_ACCOUNT_ADDR);
        assert!(dataset_index < Vector::length(&datasets_info.datasets), E_NOT_FOUND);

        // Get dataset details
        let dataset = Vector::borrow(&datasets_info.datasets, dataset_index);

        // If the dataset is not free, check payment
        if (!dataset.free) {
            assert!(payment_amount >= dataset.price, E_RESOURCE_NOT_ENOUGH);

            // Transfer payment from buyer to provider using FLCoin
            coin::transfer<FLC>(
                buyer, 
                dataset.provider_address, 
                payment_amount
            );
        }

        // Access granted to the dataset (frontend handles IPFS link retrieval)
    }
   
  public entry fun return_model_weights(
    provider: &signer,
    weights_ipfs_link: vector<u8>
) acquires TrainingRequests,MyResourceAccount,ModelWeightsvector {
    let provider_address = signer::address_of(provider);
    
    // Borrow global mutable access to TrainingRequests
    let requests = borrow_global_mut<TrainingRequests>(RESOURCE_ACCOUNT_ADDR);

    // Initialize variables
    let found = false;
    let len = Vector::length(&requests.requests);
    let i = 0;
    // Retrieve the resource account's SignerCapability from MyResourceAccount
    let my_resource_account = borrow_global<MyResourceAccount>(RESOURCE_ACCOUNT_ADDR);
    let resource_signer = account::create_signer_with_capability(&my_resource_account.signer_cap);
    // Iterate over the requests to find the one matching the provider and is pending
    while (i < len) {
        let request = Vector::borrow_mut(&mut requests.requests, i);

        // If provider address matches and the request is accepted (status 1)
        if (request.provider_address == provider_address ) {
            // Create a new ModelWeights struct to store the IPFS link
            let model_weights = ModelWeights {
                provider_address: provider_address,
                trainer_address: request.trainer_address,
                weights_ipfs_link: weights_ipfs_link,
            };

           // Check if ModelWeightsvector already exists in the resource account
            if (!exists<ModelWeightsvector>(RESOURCE_ACCOUNT_ADDR)) {
                // If not, initialize it with an empty vector and move it to the resource account
                let models_vector = Vector::empty<ModelWeights>();
                Vector::push_back(&mut models_vector, model_weights);
                move_to(&resource_signer, ModelWeightsvector { models: models_vector });
            } else {
                // If it exists, borrow a mutable reference and push the new ModelWeights to the vector
                let model_weights_ref = borrow_global_mut<ModelWeightsvector>(RESOURCE_ACCOUNT_ADDR);
                Vector::push_back(&mut model_weights_ref.models, model_weights);
            };
            // Update the request status to indicate that model weights have been provided
            request.status = 2; // Mark the request as completed

            // Emit an event to notify the trainer
            let message = vector[
                89, 111, 117, 114, 32, 109, 111, 100, 101, 108, 32, 119, 101, 105, 103, 104, 116, 115, 32, 
                104, 97, 118, 101, 32, 98, 101, 101, 110, 32, 115, 117, 98, 109, 105, 116, 116, 101, 100
            ]; // "Your model weights have been submitted"
            event::emit(ModelWeightsSubmittedEvent {
                trainer_address: request.trainer_address,
                provider_address: request.provider_address,
                model_ipfs_link: request.model_ipfs_link,
                dataset_ipfs_link: request.dataset_ipfs_link,
                weights_ipfs_link,
                message,
            });

            found = true;
            break;
        };
        i = i + 1;
    };

    // If no matching request was found, throw an error
    if (!found) {
        abort(E_NO_PENDING_REQUESTS_FOR_PROVIDER);
    }
}

  public entry fun pay_for_training(
    trainer: &signer,           // The trainer who is making the payment
    provider_address: address,  // The provider receiving the payment
    payment_amount: u64         // The payment amount
)  {
    // Ensure the trainer has enough balance (optional check)
    // Perform the payment using the trainer's signer account
    coin::transfer<FLC>(
        trainer,           // Trainer's signer
        provider_address,  // Provider's address
        payment_amount     // The amount to be paid
    );
}


 public entry fun delete_dataset(account: &signer, dataset_index: u64) acquires DatasetsInfo {
    let datasets_info = borrow_global_mut<DatasetsInfo>(RESOURCE_ACCOUNT_ADDR);

    // Ensure that the dataset exists
    assert!(dataset_index < Vector::length(&datasets_info.datasets), E_NOT_FOUND);

    // Only allow the provider who shared the dataset to delete it
    let dataset = Vector::borrow(&datasets_info.datasets, dataset_index);
    assert!(dataset.provider_address == signer::address_of(account), E_NOT_ALLOWED);

    // Remove the dataset from the list
    Vector::remove(&mut datasets_info.datasets, dataset_index);
}


    /// Function to delete a resource. Only the owner of the resource can delete it.
    public entry fun delete_resource(account: &signer, resource_index: u64) acquires ResourceProviders {
        let provider_address = signer::address_of(account);
        let providers_info = borrow_global_mut<ResourceProviders>(RESOURCE_ACCOUNT_ADDR);

        assert!(resource_index < Vector::length(&providers_info.providers), E_ITEM_NOT_FOUND);

        let provider = Vector::borrow(&providers_info.providers, resource_index);

        // Ensure that the account calling the delete function is the owner of the resource
        assert!(provider.address == provider_address, E_NOT_OWNER);

        // Remove the resource from the providers vector
        Vector::remove(&mut providers_info.providers, resource_index);
    }

    /// Function to delete a training request. Only the trainer who submitted the request can delete it.
    public entry fun delete_training_request(account: &signer, request_index: u64) acquires TrainingRequests {
        let trainer_address = signer::address_of(account);
        let requests_info = borrow_global_mut<TrainingRequests>(RESOURCE_ACCOUNT_ADDR);

        assert!(request_index < Vector::length(&requests_info.requests), E_ITEM_NOT_FOUND);

        let request = Vector::borrow(&requests_info.requests, request_index);

        // Ensure that the account calling the delete function is the owner (trainer) of the request
        assert!(request.trainer_address == trainer_address, E_NOT_OWNER);

        // Remove the request from the requests vector
        Vector::remove(&mut requests_info.requests, request_index);
    }

}
