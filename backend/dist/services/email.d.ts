interface PurchaseEmail {
    to: string;
    name: string;
    downloadToken: string;
    purchaseId: number;
    amount: number;
}
export declare function sendPurchaseEmail(data: PurchaseEmail): Promise<void>;
export {};
//# sourceMappingURL=email.d.ts.map