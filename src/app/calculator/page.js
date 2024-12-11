"use client";

import { useState, useEffect } from "react";
import CurrencyInput from "react-currency-input-field";
import { formatToRupiah } from "@/helpers/currency";

export default function Calculator(){
    const [openingBalance, setOpeningBalance] = useState(0);
    const [buyAmount, setBuyAmount] = useState(0);
    const [sellAmount, setSellAmount] = useState(0);
    const [percentageOfBalance, setPersentageOfBalance] = useState(100);
    const [buyMethod, setBuyMethod] = useState('limitOrder');
    const [buyFee, setBuyFee] = useState(0.2311);
    const [sellMethod, setSellMethod] = useState('limitOrder');
    const [sellFee, setSellFee] = useState(0.3216);
    const [trxCount, setTrxCount] = useState(1);
    const [transactions, setTransactions] = useState([]);
    const [totalProfit, setTotalProfit] = useState(0);
    const [lastAssetBalance, setLastAssetBalance] = useState(0);
    const [totalAllocationOfAmount, setTotalAllocationOfAmount] = useState(0);
    const [marginAmount, setMarginAmount] = useState(0);
    const [totalBuyFeeAmount, setTotalBuyFeeAmount] = useState(0);
    const [totalSellFeeAmount, setTotalSellFeeAmount] = useState(0);

    const calculateProfitEstimation = (e) => {
        e.preventDefault();

        if(openingBalance < 1 || buyAmount < 1 || sellAmount < 1){
            alert("Please fill the form!");
            return;
        }

        setTransactions([]);
        
        let lastBalance = openingBalance;
        let totalBuyFee = 0;
        let totalSellFee = 0;
        let trxs = [];

        for(let i=0; i < trxCount;i++){
            
            let assetBalance = lastBalance;

            /**
             * calculate Total Allocation Of Amount
             */
            const totalAllocationOfAmount = percentageOfBalance/100 * assetBalance;

            /**
             * calculate Total Fee Amount Of Buying Transaction
             */

            const buyFeeAmount = buyFee/100 * totalAllocationOfAmount;

            totalBuyFee += buyFeeAmount;

            /**
             * calculate Total Net Allocation Of Amount
             */

            const totalNetBuyTrx = totalAllocationOfAmount - buyFeeAmount;

            /**
             * calculate Total Coins Amount
             */

            const totalCoinAmount = totalNetBuyTrx/buyAmount;

            /**
             * calculate Total Sell Transaction
             */

            const totalSellTrx = totalCoinAmount * sellAmount;

            /**
             * calculate Total Fee Amount Of Selling Transaction
             */

            const sellFeeAmount = sellFee/100 * totalSellTrx;

            totalSellFee += sellFeeAmount;
            
            /**
             * calculate Total Net Sell Transaction
             */

            const totalNetSellTrx = totalSellTrx - sellFeeAmount;

            /**
             * calculate Profit
             */

            const totalNetProfit = totalNetSellTrx - totalNetBuyTrx;

            /**
             * calculate Last Balance
             */

            lastBalance = parseInt(assetBalance) + parseInt(totalNetProfit);
            

            const newTransaction = {
                assetBalance : assetBalance,
                percentageOfBalance: percentageOfBalance,
                totalAllocationOfAmount: totalAllocationOfAmount,
                buyFeeAmount: buyFeeAmount,
                totalNetBuyTrx: totalNetBuyTrx,
                totalCoinAmount: totalCoinAmount,
                totalSellTrx: totalSellTrx,
                sellFeeAmount: sellFeeAmount,
                totalNetSellTrx: totalNetSellTrx,
                totalNetProfit: totalNetProfit,
                totalNetAssetBalance: lastBalance
            }

            trxs.push(newTransaction);

        }

        setTotalBuyFeeAmount(totalBuyFee);
        setTotalSellFeeAmount(totalSellFee);
        setTotalProfit(lastBalance - openingBalance);
        setLastAssetBalance(lastBalance);
        setTransactions(trxs);

    }

    useEffect(()=>{
        
        

        if(sellAmount > 0 && buyAmount > 0){
            
            const margin = sellAmount - buyAmount;
            setMarginAmount(margin);  

        }
       
    
        if(openingBalance > 0 && percentageOfBalance > 0){
            
            const totalAllocation = percentageOfBalance/100 * openingBalance;
            setTotalAllocationOfAmount(totalAllocation);

        }

        if(buyMethod == 'limitOrder'){
            setBuyFee(0.2311);
        }else if(buyMethod == 'marketOrder'){
            setBuyFee(0.3322);
        }

        if(sellMethod == 'limitOrder'){
            setSellFee(0.3216);
        }else if(buyMethod == 'marketOrder'){
            setSellFee(0.3222);
        }

        setTransactions([]);

    },[sellAmount,buyAmount,openingBalance,percentageOfBalance,buyMethod,trxCount]);


    const resetForm = ()=>{
        setOpeningBalance(0);
        setPersentageOfBalance(100);

        setBuyAmount(0);
        setBuyMethod('limitOrder');
        setBuyFee(0.2311);

        setSellAmount(0);
        setSellMethod('limitOrder');
        setSellFee(0.3216);
    }

    return (
        <div className="min-h-screen bg-gray-100">
      
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold text-center mb-6 text-black">Profit Estimation Calculator</h1>
                <div className="grid grid-cols-[20%,80%] gap-8">
                    <div className="form-col">
                        <form className="space-y-4">
                            <div>
                                <label htmlFor="openingBalance" className="block text-sm font-medium text-black mb-2">
                                 Opening Balance (Rp)
                                </label>
                                <CurrencyInput
                                id="openingBalance"
                                name="openingBalance"
                                value={openingBalance}
                                decimalsLimit={0}
                                groupSeparator="."
                                decimalSeparator=","
                                prefix="Rp "
                                onValueChange={(value) => setOpeningBalance(value || "")}
                                className="w-full p-2 border rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter opening balance"
                                />
                            </div>
                            <div>
                                <label htmlFor="percentageOfBalance" className="block text-sm font-medium text-black mb-2">
                                 Balance Allocation (%)
                                </label>
                                <select
                                id="percentageOfBalance"
                                value={percentageOfBalance}
                                onChange={(e) => setPersentageOfBalance(e.target.value)}
                                className="w-full p-2 border rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="100">100 %</option>
                                    <option value="75">75 %</option>
                                    <option value="50">50 %</option>
                                    <option value="25">25 %</option>
                                </select>
                            </div>
                            
                            <div>
                                <label htmlFor="buyAmount" className="block text-sm font-medium text-black mb-2">
                                Recurring Buy Amount (Rp)
                                </label>
                                <CurrencyInput
                                id="buyAmount"
                                name="buyAmount"
                                value={buyAmount}
                                decimalsLimit={0}
                                groupSeparator="."
                                decimalSeparator=","
                                prefix="Rp "
                                onValueChange={(value) => setBuyAmount(value || "")}
                                className="w-full p-2 border rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter buy amount"
                                />
                            </div>
                            <div>
                                <label htmlFor="buyMethod" className="block text-sm font-medium text-black mb-2">
                                 Buy Method
                                </label>
                                <select
                                id="buyMethod"
                                value={buyMethod}
                                onChange={(e) => setBuyMethod(e.target.value)}
                                className="w-full p-2 border rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="limitOrder">Limit Order</option>
                                    <option value="marketOrder">Market Order</option>
                                </select>
                            </div>
                            
                            <div>
                                <label htmlFor="sellAmount" className="block text-sm font-medium text-black mb-2">
                                 Recurring Sell Amount (Rp)
                                </label>
                                <CurrencyInput
                                id="sellAmount"
                                name="sellAmount"
                                value={sellAmount}
                                decimalsLimit={0}
                                groupSeparator="."
                                decimalSeparator=","
                                prefix="Rp "
                                onValueChange={(value) => setSellAmount(value || "")}
                                className="w-full p-2 border rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter sell amount"
                                />
                            </div>
                            <div>
                                <label htmlFor="sellMethod" className="block text-sm font-medium text-black mb-2">
                                 Sell Method
                                </label>
                                <select
                                id="sellMethod"
                                value={sellMethod}
                                onChange={(e) => setSellMethod(e.target.value)}
                                className="w-full p-2 border rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="limitOrder">Limit Order</option>
                                    <option value="marketOrder">Market Order</option>
                                </select>
                            </div>
                            <button
                            type="button"
                            onClick={resetForm}
                            className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                            Reset
                            </button>
                        </form>
                    </div>
                    <div className="result-col border p-6 bg-white shadow rounded">

                        <h1 className="text-black font-bold text-3xl text-center">Trading Plan</h1>

                        <table className="mt-5 w-full text-black border-collapse border border-slate-500 table-auto">
                            <tbody>
                                <tr key="1" className="odd:bg-blue-100">
                                    <td className="px-4 py-2 text-right border border-gray-300">Opening Balance</td>
                                    <td className="px-4 py-2 text-right border border-gray-300"><span className="font-bold text-xl">{formatToRupiah(openingBalance)}</span></td>
                                    <td className="px-4 py-2 text-right border border-gray-300">Recurring Sell Amount</td>
                                    <td className="px-4 py-2 text-right border border-gray-300"><span className="font-bold text-xl">{formatToRupiah(sellAmount)}</span></td>
                                </tr>
                                <tr key="2" className="odd:bg-blue-100">
                                    <td className="px-4 py-2 text-right border border-gray-300">Balance Allocation</td>
                                    <td className="px-4 py-2 text-right border border-gray-300"><span className="font-bold text-xl">{percentageOfBalance} %</span></td>
                                    <td className="px-4 py-2 text-right border border-gray-300">Recurring Sell Method</td>
                                    <td className="px-4 py-2 text-right border border-gray-300"><span className="font-bold text-xl">{ (sellMethod=='limitOrder') ? 'Limit Order' : 'Market Order'}</span></td>
                                </tr>
                                <tr key="3" className="odd:bg-blue-100">
                                    <td className="px-4 py-2 text-right border border-gray-300">Recurring Buy Amount</td>
                                    <td className="px-4 py-2 text-right border border-gray-300"><span className="font-bold text-xl">{formatToRupiah(buyAmount)}</span></td>
                                    <td className="px-4 py-2 text-right border border-gray-300">Exchange Sell Fee</td>
                                    <td className="px-4 py-2 text-right border border-gray-300"><span className="font-bold text-xl">{ (sellMethod=='limitOrder') ? '0.3216 %' : '0.3222 %'}</span></td>
                                </tr>
                                <tr key="4" className="odd:bg-blue-100">
                                    <td className="px-4 py-2 text-right border border-gray-300">Recurring Buy Method</td>
                                    <td className="px-4 py-2 text-right border border-gray-300"><span className="font-bold text-xl">{ (buyMethod=='limitOrder') ? 'Limit Order' : 'Market Order'}</span></td>
                                    <td className="px-4 py-2 text-right border border-gray-300">Margin</td>
                                    <td className="px-4 py-2 text-right border border-gray-300"><span className="font-bold text-xl">{formatToRupiah(sellAmount-buyAmount)}</span></td>
                                </tr>
                                <tr key="5" className="odd:bg-blue-100">
                                    <td className="px-4 py-2 text-right border border-gray-300">Exchange Buy Fee</td>
                                    <td className="px-4 py-2 text-right border border-gray-300"><span className="font-bold text-xl">{ (buyMethod=='limitOrder') ? '0.2311 %' : '0.3322 %'}</span></td>
                                    <td className="px-4 py-2 text-right border border-gray-300"></td>
                                    <td className="px-4 py-2 text-right border border-gray-300"></td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <form onSubmit={calculateProfitEstimation} className="flex space-x-5 p-4 mt-5">
                            <input
                            id="trxCount"
                            type="number"
                            value={trxCount}
                            onChange={(e) => setTrxCount(e.target.value)}
                            className="w-full text-black px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                            type="submit"
                            className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                            Estimate Transaction
                            </button>
                        </form>

                        {transactions.length > 0 &&(
                            <>
                                <div className="mt-5">
                                    <h1 className="font-bold text-black text-2xl">Summary from {trxCount} transactions :</h1>
                                    <table className="w-full mt-5 text-black border-collapse border border-slate-500 table-auto">
                                        <tbody>
                                            <tr key="11" className="odd:bg-purple-100">
                                                <td className="px-4 py-2 text-right border border-gray-300">Opening Balance</td>
                                                <td className="px-4 py-2 text-right border border-gray-300 font-bold">{formatToRupiah(openingBalance)}</td>
                                                <td className="px-4 py-2 text-right border border-gray-300">Total Buy Fee Amount</td>
                                                <td className="px-4 py-2 text-right border border-gray-300 font-bold">{formatToRupiah(totalBuyFeeAmount)}</td>
                                            </tr>
                                            <tr key="12" className="odd:bg-purple-100">
                                                <td className="px-4 py-2 text-right border border-gray-300">Total Profit Amount</td>
                                                <td className="px-4 py-2 text-right border border-gray-300 font-bold">{formatToRupiah(totalProfit)}</td>
                                                <td className="px-4 py-2 text-right border border-gray-300">Total Sell Fee Amount</td>
                                                <td className="px-4 py-2 text-right border border-gray-300 font-bold">{formatToRupiah(totalSellFeeAmount)}</td>
                                            </tr>
                                            <tr key="13" className="odd:bg-purple-100">
                                                <td className="px-4 py-2 text-right border border-gray-300">Total Asset Balance</td>
                                                <td className="px-4 py-2 text-right border border-gray-300 font-bold">{formatToRupiah(lastAssetBalance)}</td>
                                                <td className="px-4 py-2 text-right border border-gray-300">Total Fee Amount</td>
                                                <td className="px-4 py-2 text-right border border-gray-300 font-bold">{formatToRupiah(totalBuyFeeAmount + totalSellFeeAmount)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-5">
                                    <h1 className="font-bold text-black text-2xl">Transaction details :</h1>
                                    {transactions.map((transaction,index)=>{

                                        return (
                                            <div key={'trx_'+index} className="w-full text-black mt-10">
                                                <h1 className="font-bold text-lg">Transaction #{index+1}</h1>
                                                <hr></hr>
                                                <h1 className="mt-5 text-green-800 font-bold">Buy Asset</h1>
                                                <div className="overflow-auto">
                                                    <table className="w-full text-black border-collapse border border-slate-500 table-auto">
                                                        <thead>
                                                            <tr className="bg-green-100">
                                                                <th className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    Balance
                                                                </th>
                                                                <th className="text-nowrap px-4 py-2 text-right border border-gray-300">   
                                                                    Persentage Allocation
                                                                </th>
                                                                <th className="text-nowrap px-4 py-2 text-right border border-gray-300"> 
                                                                    Amount Allocation 
                                                                </th>
                                                                <th className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    Persentage Fee
                                                                </th>
                                                                <th className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    Amount Fee
                                                                </th>
                                                                <th className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    Net Amount Allocation    
                                                                </th>
                                                                <th className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    Buy Amount
                                                                </th>
                                                                <th className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    Coins Amount
                                                                </th>
                                                            </tr>
                                                            
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    {formatToRupiah(transaction.assetBalance)}
                                                                </td>
                                                                <td className="text-nowrap px-4 py-2 text-right border border-gray-300">   
                                                                    {transaction.percentageOfBalance + ' %'}
                                                                </td>
                                                                <td className="text-nowrap px-4 py-2 text-right border border-gray-300"> 
                                                                    {formatToRupiah(transaction.totalAllocationOfAmount)}
                                                                </td>
                                                                <td className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    {buyFee+' %'}
                                                                </td>
                                                                <td className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    {formatToRupiah(transaction.buyFeeAmount)}
                                                                </td>
                                                                <td className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    {formatToRupiah(transaction.totalNetBuyTrx)}   
                                                                </td>
                                                                <td className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    {formatToRupiah(buyAmount)}
                                                                </td>
                                                                <td className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    {transaction.totalCoinAmount.toFixed(2)}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <h1 className="mt-5 text-red-800 font-bold">Sell Asset</h1>
                                                <div className="overflow-auto">
                                                    <table className="w-full text-black border-collapse border border-slate-500 table-auto">
                                                        <thead>
                                                            <tr className="bg-red-100">
                                                                <th className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    Coins Amount
                                                                </th>
                                                                <th className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    Sell Amount
                                                                </th>
                                                                <th className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    Total Sell Transaction
                                                                </th>
                                                                <th className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    Persentage Fee
                                                                </th>
                                                                <th className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    Amount Fee
                                                                </th>
                                                                <th className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    Total Net Transaction    
                                                                </th>
                                                                <th className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    Profit Amount
                                                                </th>
                                                                <th className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    Balance
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    {transaction.totalCoinAmount.toFixed(2)}
                                                                </td>
                                                                <td className="text-nowrap px-4 py-2 text-right border border-gray-300">   
                                                                    {formatToRupiah(sellAmount)}
                                                                </td>
                                                                <td className="text-nowrap px-4 py-2 text-right border border-gray-300"> 
                                                                    {formatToRupiah(transaction.totalSellTrx)}
                                                                </td>
                                                                <td className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    {sellFee + ' %'}
                                                                </td>
                                                                <td className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    {formatToRupiah(transaction.sellFeeAmount)}
                                                                </td>
                                                                <td className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    {formatToRupiah(transaction.totalNetSellTrx)}   
                                                                </td>
                                                                <td className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    {formatToRupiah(transaction.totalNetProfit)}
                                                                </td>
                                                                <td className="text-nowrap px-4 py-2 text-right border border-gray-300">
                                                                    {formatToRupiah(transaction.totalNetAssetBalance)}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )

                                    })}
                                </div>
                            </>
                        )}
                               
                    </div>
                </div>
            </div>
        
        </div>
    )

}