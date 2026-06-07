interface Subscriber {
    email: string;
    name: string;
    source: "purchase" | "website";
    tags: string[];
}
/**
 * Adiciona inscrito à newsletter (Mailchimp ou fallback)
 */
export declare function addSubscriber(subscriber: Subscriber): Promise<void>;
export {};
//# sourceMappingURL=newsletter.d.ts.map