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
    use aptos_std::simple_map::{Self, SimpleMap};
    use aptos_framework::event;
    // Errors
    const E_NOT_FOUND: u64 =12121;
    const E_ALREADY_INITIALIZED: u64=5;
    const E_NOT_INITIALIZED: u64 = 1;
    const E_RESOURCE_NOT_ENOUGH: u64 = 2;
    const E_INVALID_RESOURCE: u64=3;
    const E_RESOURCE_PROVIDERS_NOT_FOUND: u64 = 404;
    const E_RESOURCE_ACCOUNT_NOT_FOUND: u64 = 0x1001;
    const E_NO_PENDING_REQUESTS_FOR_PROVIDER: u64 = 101;

    const RESOURCE_ACCOUNT_ADDR: address = @0xba910884da53913141fdfa5402d9eb75ef3822183be3c38611e0f732b13ec3e3;
    const REGISTRY_ACCOUNT: address = @0x7bd9bb2504dc088c5d48161a860339e155be05208164888eca2f845a36a51e50;
    struct MyResourceAccount has key {
        signer_cap: account::SignerCapability,
    }
    

    struct ResourceProvider has key, copy,drop, store {
        address: address,
        cpu: u64,
        gpu: u64,
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

    struct ModelWeights has key {
        provider_address: address,   // Address of the resource provider
        trainer_address: address,    // Address of the model trainer
        weights_ipfs_link: vector<u8> // IPFS link to the trained model weights
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

    
    }
   
  
    
    // Public function to register resources
public entry fun register_resources(
    account: &signer,
    cpu: u64,
    gpu: u64,
    is_external: bool,
) acquires ResourceProviders, MyResourceAccount {
    // Validate input resources (e.g., ensure non-negative values)
    assert!(cpu > 0, E_INVALID_RESOURCE);
    assert!(gpu > 0, E_INVALID_RESOURCE);

    // Create a new provider object
    let provider = ResourceProvider {
        address: signer::address_of(account),
        cpu: cpu,
        gpu: gpu,
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


   public fun get_all_registered_resources(): vector<ResourceProvider> acquires ResourceProviders {
    // Define the resource account address
    let resource_account_address = RESOURCE_ACCOUNT_ADDR;
    
    // Check if ResourceProviders exists at the resource account address
    assert!(exists<ResourceProviders>(resource_account_address), E_NOT_FOUND);

    // Borrow a reference to the ResourceProviders resource
    let providers_ref = borrow_global<ResourceProviders>(resource_account_address);

    // Return the vector of registered resource providers
    providers_ref.providers
}


    public fun allocate_resource(
        account: &signer,
        provider_address: address,
        cpu: u64,
        gpu: u64,
        allocation_time: u64,
        payment_amount: u64,
    ) acquires ResourceProvider {
        let provider = borrow_global_mut<ResourceProvider>(provider_address);
        // Check if the provider has enough resources
        assert!(provider.cpu >= cpu && provider.gpu >= gpu, E_RESOURCE_NOT_ENOUGH);

        // Subtract the allocated resources
        provider.cpu = provider.cpu - cpu;
        provider.gpu = provider.gpu - gpu;

        let allocation = Allocation {
            cpu: cpu,
            gpu: gpu,
            model_trainer: signer::address_of(account),
            resource_provider: provider_address,
            allocation_time: allocation_time,
            payment_amount: payment_amount,
        };
        move_to(account, allocation);
    }

    public fun pay_resource_provider(
        payer: &signer,
        provider_address: address,
        payment_amount: u64,
    )  {
        // Transfer the payment amount from the payer's account to the resource provider
        coin::transfer<AptosCoin>(payer, provider_address, payment_amount);
    }

}