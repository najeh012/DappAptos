module TrusTrain::Test {

    use std::debug;
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::coin::CoinStore;
    use aptos_framework::aptos_coin::AptosCoin;
    use TrusTrain::AddrDeploy;

    // Test function to register resources
    public fun test_register_resources(account: signer) {
        AddrDeploy::register_resources(&account, 16, 4, false);
        debug::print(&std::string::utf8(b"Resources registered successfully."))
    }

    // Test function to allocate resources
    public fun test_allocate_resource(account: signer, provider: signer) {
        AddrDeploy::register_resources(&provider, 16, 4, false);
        AddrDeploy::allocate_resource(&account, signer::address_of(&provider), 8, 2, 10, 100_000_000);
        debug::print(&std::string::utf8(b"Resources allocated successfully."))
    }

    // Test function to pay the resource provider
    public fun test_pay_resource_provider(account: signer, provider: signer) {
        AddrDeploy::register_resources(&provider, 16, 4, false);
        AddrDeploy::allocate_resource(&account, signer::address_of(&provider), 8, 2, 10, 100_000_000);
        AddrDeploy::pay_resource_provider(&account, signer::address_of(&provider), 100_000_000);
        debug::print(&std::string::utf8(b"payment successfully."))
    }

   
}
