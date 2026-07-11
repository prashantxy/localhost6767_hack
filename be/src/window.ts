import {activeWindow} from "active-win";

export async function getActiveWindow(){

 const result = await activeWindow();


 return {
   app: result?.owner.name ?? "Unknown",
   title: result?.title ?? ""
 };

}