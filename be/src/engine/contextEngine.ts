import { eventBus } from "./eventBus";
import type { ContextEvent } from "../types/context";

export class ContextEngine {

    start(){

        eventBus.on("context",(context:ContextEvent)=>{

            console.log("Received Context");

            console.log(context);

        });

    }

}