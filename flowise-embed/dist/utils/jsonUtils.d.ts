export declare enum customBooleanValues {
    NOT_FOUND = "N\u00E3o consta",
    FOUND = "Consta",
    FALSE_WITH_JUSTIFICATION = "N\u00E3o, "
}
export declare function sanitizeJson<T>(json: T): T;
export declare function sanitizeToFlatArray(input: any): any[];
export declare const compareAndMergeArrays: (firstArray: any[], secondArray: any[]) => any[];
export declare const isNonEmptyArrayOrObject: (value: any) => boolean;
//# sourceMappingURL=jsonUtils.d.ts.map