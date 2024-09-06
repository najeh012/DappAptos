module TrusTrain::TrusTrain {
    
    use std::signer;
    use aptos_framework::resource_account;
    use aptos_framework::coin;
    use aptos_framework::coin::CoinStore;
    use aptos_framework::aptos_coin::AptosCoin;
    use std::option::Option;
    use std::vector::{Self as Vector, empty, push_back};

    // Errors
    const E_NOT_INITIALIZED: u64 = 1;
    const E_RESOURCE_NOT_ENOUGH: u64 = 2;
    const E_INVALID_RESOURCE: u64=3;
   
    const RESOURCE_ACCOUNT_ADDR: address = @0x46982b8c28283f7d1a02e6f5b979a5df7eba588417ea809f97620dcb87f6991b;
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

    // Initialize the ResourceProviders globally at the fixed address (RESOURCE_ACCOUNT_ADDR)
    public entry fun initialize_providers(signer: &signer) {
        let providers = ResourceProviders {
            providers: Vector::empty(),
        };

        // Use the specified address to move the ResourceProviders
        move_to<ResourceProviders>(signer, providers);
    }



    public entry fun register_resources(
        account: &signer,
        cpu: u64,
        gpu: u64,
        is_external: bool,
    ) acquires ResourceProviders {
        // Validate input resources (e.g., ensure non-negative values)
        assert!(cpu > 0, E_INVALID_RESOURCE);
        assert!(gpu > 0, E_INVALID_RESOURCE);

        // Create a new ResourceProvider struct
        let provider = ResourceProvider {
            address: signer::address_of(account),
            cpu: cpu,
            gpu: gpu,
            is_external: is_external,
        };

         // Use the derived address of the resource account to access the global ResourceProviders
    
        let providers = borrow_global_mut<ResourceProviders>(RESOURCE_ACCOUNT_ADDR);

        // Add the new provider to the list of providers
        push_back(&mut providers.providers, provider);
    }

    public fun get_all_registered_resources(): vector<ResourceProvider> acquires ResourceProviders {
       
        let providers = borrow_global<ResourceProviders>(RESOURCE_ACCOUNT_ADDR); 
        providers.providers
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