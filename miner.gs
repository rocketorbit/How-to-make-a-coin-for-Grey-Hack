coin_name = ""
coin_user = ""
coin_pass = ""
miner_hard_limit = 3000
blockchain = include_lib("/lib/blockchain.so")
if not blockchain then blockchain = include_lib(current_path + "/blockchain.so")
if not blockchain then
    aptclient = include_lib("/lib/aptclient.so")
    if not aptclient then aptclient = include_lib(current_path + "/aptclient.so")
    if not aptclient then exit("Error: blockchain.so and aptclient.so not found")
    aptclient.update
    aptclient.install("blockchain.so")
    blockchain = include_lib("/lib/blockchain.so")
    if not blockchain then exit("Error: blockchain.so not found")
end if
coin = blockchain.get_coin(coin_name, coin_user, coin_pass)
while true
    subWalletUser = user_input("input subwallet username: ")
    subWalletPass = user_input("input subwallet password: ", true)
    subWallet = coin.get_subwallet(subWalletUser)
    if (typeof(subWallet) != "subwallet") or (subWallet.check_password != true) then break
    print("Error: Invalid username or password")
end while
i = 0
while true
    clear_screen
    if blockchain.amount_mined(coin_name) >= miner_hard_limit then exit("Mining disabled.")
    if i == 0 then print("Started mining...")
    print("Mining for subwallet " + subWallet.get_user + " (Which is wallet " + subWallet.wallet_username + ")")
    subWallet.mining
    i = i + 1
    print(i + " mining cycles done.")
    print(coin.get_reward + " " + coin_name + " added to subwallet.")
    print("New balance: " + subWallet.get_balance)
end while
