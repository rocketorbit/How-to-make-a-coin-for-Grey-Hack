coin_name = ""
coin_user = ""
coin_pass = ""
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

features = {}
features["balance"] = {"name": "balance"}
features["balance"]["run"] = function()
    subWalletUser = user_input("username: ")
    subWalletPass = user_input("password: ", true)
    subWallet = coin.get_subwallet(subWalletUser)
    if not typeof(subWallet) == "subwallet" then return user_input("Error: invalid user or password.", false, true)
    if not subWallet.check_password(subWalletPass) then return user_input("Error: invalid user or password.", false, true)
    return user_input("Balance: " + subWallet.get_balance, false, true)
end function
features["transaction"] = {"name": "transaction"}
features["transaction"]["run"] = function()
    subWalletUser = user_input("Subwallet username: ")
    subWalletPass = user_input("Subwallet password: ", true)
    reciever = user_input("Reciever subwallet username: ")
    amount = user_input("Amount: ").to_int
    if not typeof(amount) == "number" then return user_input("Error: invalid amount.", false, true)
    subWallet = coin.get_subwallet(subWalletUser)
    recieverSubWallet = coin.get_subwallet(reciever)
    if not typeof(subWallet) == "subwallet" then return user_input("Error: invalid sender/reciever/password.", false, true)
    if not subWallet.check_password(subWalletPass) then return user_input("Error: invalid sender/reciever/password.", false, true)
    if not typeof(recieverSubWallet) == "subwallet" then return user_input("Error: invalid sender/reciever/password.", false, true)
    tryTransaction = coin.transaction(subWalletUser, reciever, amount)
    if typeof(tryTransaction) == "string" then return user_input(tryTransaction, false, true)
    return user_input("Transaction done.", false, true)
end function
features["create_subwallet"] = {"name": "create_subwallet"}
features["create_subwallet"]["run"] = function()
    print("You are trying to create a subwallet for " + coin_name + ". You can get your PIN and wallet username from command ""wallet"".")
    subWalletID = user_input("Wallet Username: ")
    subWalletPin = user_input("PIN: ", true)
    subWalletUser = user_input("Subwallet user: ")
    subWalletPass = user_input("Subwallet pass: ", true)
    tryCreateSubWallet = coin.create_subwallet(subWalletID, subWalletPin, subWalletUser, subWalletPass)
    if tryCreateSubWallet == true then return user_input("Subwallet Created!", false, true)
    return user_input("Error: " + tryCreateSubWallet, false, true)
end function
features["delete_subwallet"] = {"name": "delete_subwallet"}
features["delete_subwallet"]["run"] = function()
    print("You are about to delete a subwallet for " + coin_name + ". You will lose everything in it forever!")
        subWalletUser = user_input("Subwallet user: ")
        subWalletPass = user_input("Subwallet pass: ", true)
        subWallet = coin.get_subwallet(subWalletUser)
        if not typeof(subWallet) == "subwallet" then return user_input("Error: invalid user or password.", false, true)
        if not subWallet.check_password(subWalletPass) then return user_input("Error: invalid user or password.", false, true)
        print("You are about to delete subwallet " + subWalletUser + " for coin " + coin_name + ". It has " + subWallet.get_balance + " in it. It is binding with " + subWallet.wallet_username + " wallet.")
        print("If you are sure that you want to delete your subwallet, type ""Do as I say! Delete my subwallet!"" to confirm.")
        print("THIS WILL DELETE EVERYTHING IN IT FOREVER!")
        confirm = user_input("> ")
        if confirm == "Do as I say! Delete my subwallet!" then
            tryDelete = subWallet.delete
            if typeof(tryDelete) == "string" then return user_input(tryDelete, false, true)
            if tryDelete == true then return user_input("Subwallet deleted.", false, true)
            if tryDelete == false then return user_input("Subwallet not found!", false, true)
            return user_input("Unknown error.", false, true)
        end if
        return user_input("Delete canceled.", false, true)
end function
features["emergency_delete_subwallet"] = {"name": "emergency_delete_subwallet"}
features["emergency_delete_subwallet"]["run"] = function()
    print("This will require you to enter wallet credentials.")
    print("This is only for when you forgot your subwallet credentials.")
    print("If you do not trust this script dont use this feature. (You better not.)")
    print("Instead, contact coin owner to help you delete your subwallet without wallet credentials.")
    print("You are about to delete a subwallet for " + coin_name + ". You will lose everything in it forever!")
    walletUser = user_input("Wallet user: ")
    walletPass = user_input("Wallet pass: ")
    tryLoginWallet = blockchain.login_wallet(walletUser, walletPass)
    if not typeof(tryLoginWallet) == "wallet" then return user_input("Error: Invalid wallet username/password", false, true)
    subWallet = null
    for trySubWallet in coin.get_subwallets
        if trySubWallet.wallet_username == walletUser then
            subWallet = trySubWallet
            break
        end if
    end for
    if not subWallet then return user_input("Error: did not find subwallet binded to this wallet", false, true)
    print("You are about to delete subwallet " + subWallet.get_user + " for coin " + coin_name + ". It has " + subWallet.get_balance + " in it. It is binding with " + subWallet.wallet_username + " wallet.")
    print("If you are sure that you want to delete your subwallet, type ""Do as I say! Delete my subwallet!"" to confirm.")
    print("THIS WILL DELETE EVERYTHING IN IT FOREVER!")
    confirm = user_input("> ")
    if confirm == "Do as I say! Delete my subwallet!" then
        tryDelete = subWallet.delete
        if typeof(tryDelete) == "string" then return user_input(tryDelete, false, true)
        if tryDelete == true then return user_input("Subwallet deleted.", false, true)
        if tryDelete == false then return user_input("Subwallet not found!", false, true)
        return user_input("Unknown error.", false, true)
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