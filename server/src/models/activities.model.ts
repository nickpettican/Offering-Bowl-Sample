import { validateActivity } from "../_db/validators";
import { putItem } from "../_db/helpers";
import { TABLES, Activity } from "../_db/schemas";
import { UnprocessableEntityError } from "../_utils/httpError";

export const logActivity = async (activity: Activity) => {
    if (!validateActivity(activity)) {
        throw new UnprocessableEntityError(
            `Invalid activity data: ${JSON.stringify(validateActivity.errors)}`
        );
    }
    return await putItem(TABLES.ACTIVITIES, activity);
};
