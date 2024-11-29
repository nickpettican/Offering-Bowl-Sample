import { NativeAttributeValue } from "@aws-sdk/lib-dynamodb";

export interface OptionalQueryParams {
    limit?: number;
    lastEvaluatedKey?: Record<string, NativeAttributeValue>;
}
