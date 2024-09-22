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
    // Errors
    const E_ALREADY_INITIALIZED: u64=5;
    const E_NOT_INITIALIZED: u64 = 1;
    const E_RESOURCE_NOT_ENOUGH: u64 = 2;
    const E_INVALID_RESOURCE: u64=3;
    const E_RESOURCE_PROVIDERS_NOT_FOUND: u64 = 404;
    const E_RESOURCE_ACCOUNT_NOT_FOUND: u64 = 0x1001;
    const RESOURCE_ACCOUNT_ADDR: address = @0x051d3c432763dc1ec311c17fbfc206c023fdbdc1cacfb1195d9c02d206462b95;
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
    }
   
  
     
    public entry fun initialize_providers(signer: &signer) acquires MyResourceAccount{
    debug::print(&std::string::utf8(b"Initializing providers for resource account: "));

    // Retrieve the SignerCapability for the resource account
    let my_account = borrow_global<MyResourceAccount>(signer::address_of(signer));
    // Create a signer for the resource account using the SignerCapability
    let resource_signer = account::create_signer_with_capability(&my_account.signer_cap);
     debug::print(&resource_signer);
    // Debug step 3: Check if ResourceProviders already exists
    assert!(!exists<ResourceProviders>(@0xe3ca9d16389abea14e46e7022010d9f0d03843377c5c53f26616be07fb161bb8), E_ALREADY_INITIALIZED);
    // Initialize the ResourceProviders struct
    let providers = ResourceProviders {
        providers: Vector::empty(),
    };
    move_to(&resource_signer, providers);  // Try to move ResourceProviders to the resource account
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
    let resource_account = borrow_global<MyResourceAccount>(@0xe3ca9d16389abea14e46e7022010d9f0d03843377c5c53f26616be07fb161bb8);
    let resource_signer = account::create_signer_with_capability(&resource_account.signer_cap);

    // Check if ResourceProviders exists in the resource account
    if (!exists<ResourceProviders>(@0xe3ca9d16389abea14e46e7022010d9f0d03843377c5c53f26616be07fb161bb8)) {
        // Initialize a new ResourceProviders struct and add the provider
        let providers = Vector::empty<ResourceProvider>();
        Vector::push_back(&mut providers, provider);
        move_to(&resource_signer, ResourceProviders { providers });
    } else {
        // If it exists, borrow a mutable reference and add the provider
        let providers_ref = borrow_global_mut<ResourceProviders>(@0xe3ca9d16389abea14e46e7022010d9f0d03843377c5c53f26616be07fb161bb8);
        Vector::push_back(&mut providers_ref.providers, provider);
    }
}


    public fun get_all_registered_resources(): vector<ResourceProvider> acquires ResourceProviders {
       let registry_account = REGISTRY_ACCOUNT;
        if (exists<ResourceProviders>(registry_account)) {
            let providers = borrow_global<ResourceProviders>(registry_account);
            providers.providers
        } else {
            Vector::empty<ResourceProvider>()
        }
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