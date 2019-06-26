import { registerSchema } from "class-validator";


export class AgpaPhase {
    id: number;
    startDate: Date;
    endDate: Date;

    static factory(id: number, startDate: Date): AgpaPhase {
        const result = new AgpaPhase();
        result.id = id;
        result.startDate = startDate;
        return result;
    }
}


