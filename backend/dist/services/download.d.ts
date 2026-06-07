interface DownloadToken {
    purchaseId: number;
    email: string;
}
/**
 * Cria token seguro de download (256 bits, expira em 30 dias)
 */
export declare function createSecureDownloadToken(purchaseId: number, email: string): Promise<string>;
/**
 * Verifica se o token é válido (existe, não expirou, compra foi paga)
 */
export declare function verifyDownloadToken(token: string): Promise<DownloadToken | null>;
/**
 * Registra download (IP, user-agent, timestamp)
 */
export declare function recordDownload(purchaseId: number, ip: string, userAgent: string): Promise<void>;
export {};
//# sourceMappingURL=download.d.ts.map