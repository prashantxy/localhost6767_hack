import { eventBus } from "../engine/eventBus";

export function startTestCollector(){

    setInterval(()=>{

        eventBus.emit("context",{

            id:crypto.randomUUID(),

            source:"clipboard",

            timestamp:Date.now(),

            windowTitle:"VS Code",

            selectedText:"Redis PubSub"

        });

    },5000);

}