coin_name = ""
coin_user = ""
coin_pass = ""
special_pass = "123456"
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
clear_screen
print("I believe you launched this tool with some basic rules in mind.")
print("It usually boils down to these three things:")
print
print("   #1) Respect the privacy of others.")
print("   #2) Think before you type.")
print("   #3) With great power comes great responsibility.")
print
trySpecialPass = user_input("Password: ", true)
if not trySpecialPass == special_pass then exit
subWallets = coin.get_subwallets
features = {}
features["subwallets_count"] = {"name": "subwallets_count"}
features["subwallets_count"]["run"] = function()
    return user_input("There are " + subWallets.len + " subwallets.", false, true)
end function
features["subwallets_info"] = {"name": "subwallets_info"}
features["subwallets_info"]["run"] = function()
    for subWallet in subWallets
        print("Subwallet name: " + subWallet.get_user + " Subwallet balance: " + subWallet.get_balance)
        print("Subwallet info: " + subWallet.get_info + " Binded to wallet: " + subWallet.wallet_username)
        print
    end for
    user_input("There are " + subWallets.len + " subwallets.", false, true)
end function
features["last_transaction"] = {"name": "last_transaction"}
features["last_transaction"]["run"] = function()
    subWalletName = user_input("Subwallet name: ")
    subWallet = coin.get_subwallet(subWalletName)
    if not typeof(subWallet) == "subwallet" then return user_input("Subwallet not found.", false, true)
    lastTransaction = subWallet.last_transaction
    if lastTransaction.len < 4 then return user_input("No transaction found.", false, true)
    if lastTransaction[2] == 0 then
        return user_input("From " + lastTransaction[0] + " to " + subWallet.get_user + ". Amount: " + lastTransaction[1] + " Date: " + lastTransaction[3], false, true)
    else
        return user_input("From " + subWallet.get_user + " to " + lastTransaction[0] + ". Amount: " + lastTransaction[1] + " Date: " + lastTransaction[3], false, true)
    end if
end function
features["transaction"] = {"name": "transaction"}
features["transaction"]["run"] = function()
    senderName = user_input("From subwallet: ")
    senderSubwallet = coin.get_subwallet(senderName)
    if not typeof(senderSubwallet) == "subwallet" then return user_input("Sender subwallet not found.", false, true)
    recieverName = user_input("To subwallet: ")
    recieverSubwallet = coin.get_subwallet(recieverName)
    if not typeof(recieverSubwallet) == "subwallet" then return user_input("Reciever subwallet not found.", false, true)
    amount = user_input("Amount: ").to_int
    if not typeof(amount) == "number" then return user_input("Invalid amount.", false, true)
    tryTransaction = coin.transaction(senderName, recieverName, amount)
    if typeof(tryTransaction) == "string" then return user_input(tryTransaction, false, true)
    return user_input("Transaction done.", false, true)
end function
features["set_address"] = {"name": "set_address"}
features["set_address"]["run"] = function()
    address = user_input("Address: ")
    trySetAddress = coin.set_address(address)
    if trySetAddress == 1 then return user_input("Address set.", false, true)
    return user_input(trySetAddress, false, true)
end function
features["set_reward"] = {"name": "set_reward"}
features["set_reward"]["run"] = function()
    reward = user_input("Reward: ")
    trySetReward = coin.set_reward(reward)
    if trySetReward == 1 then return user_input("Reward set.", false, true)
    return user_input(trySetReward, false, true)
end function
features["set_cycle_mining"] = {"name": "set_cycle_mining"}
features["set_cycle_mining"]["run"] = function()
    cycle_mining = user_input("Cycle mining: ")
    trySetCycleMining = coin.set_cycle_mining(cycle_mining)
    if trySetCycleMining == 1 then return user_input("Cycle mining set.", false, true)
    return user_input(trySetCycleMining, false, true)
end function
features["coin_info"] = {"name": "coin_info"}
features["coin_info"]["run"] = function()
    print("Coin name: " + coin_name)
    print("Address: " + coin.get_address + " Mined coins: " + coin.get_mined_coins)
    user_input("Reward: " + coin.get_reward + " Cycle mining: " + coin.get_cycle_mining, false, true)
end function
features["delete_subwallet"] = {"name": "delete_subwallet"}
features["delete_subwallet"]["run"] = function()
    print("You are about to delete a subwallet. This action delete everything in it.")
    subWalletName = user_input("Subwallet name: ")
    subWallet = coin.get_subwallet(subWalletName)
    if not typeof(subWallet) == "subwallet" then return user_input("Subwallet not found.", false, true)
    print("You are about to delete subwallet " + subWalletName + " for coin " + coin_name + ". It has " + subWallet.get_balance + " in it. It is binding with " + subWallet.wallet_username + " wallet.")
    print("If you are sure that you want to delete this subwallet, type ""Do as I say! Delete this subwallet!"" to confirm.")
    print("THIS WILL DELETE EVERYTHING IN IT FOREVER!")
    confirm = user_input("> ")
    if confirm == "Do as I say! Delete this subwallet!" then
        tryDelete = subWallet.delete
        if typeof(tryDelete) == "string" then return user_input(tryDelete, false, true)
        if tryDelete == true then return user_input("Subwallet deleted.", false, true)
        if tryDelete == false then return user_input("Subwallet not found!", false, true)
        return user_input("Unknown error.", false, true)
    end if
    return user_input("Delete canceled.", false, true)
end function
features["delete_coin"] = {"name": "delete_coin"}
features["delete_coin"]["run"] = function()
    print("You are about to delete your coin. This action delete everything in it.")
    tryCoinPass = user_input("Coin password: ")
    if not tryCoinPass == coin_pass then return user_input("Password invalid.", false, true)
    print("You are about to delete coin " + coin_name + ". This action delete everything in it.")
    print("If you are sure that you want to delete your coin, type ""Do as I say! Delete my coin!"" to confirm.")
    confirm = user_input("> ")
    if confirm == "Do as I say! Delete my coin!" then
        tryDelete = blockchain.delete_coin(coin_name, coin_user, coin_pass)
        if typeof(tryDelete) == "string" then return user_input(tryDelete, false, true)
        if tryDelete == true then return user_input("Coin deleted. You can do Ctrl + C now.")
        return user_input(tryDelete, false, true)
    end if
    return user_input("Delete canceled.", false, true)
end function

while true
    clear_screen
    featuresName = ""
    for feature in features
        featuresName = featuresName + "[" + feature.value.name + "] "
    end for
    print(featuresName)
    select = user_input("> ").lower.trim
    if features.hasIndex(select) then
        features[select].run
        continue
    end if
    user_input("Error: command not found", false, true)
end while
