type ModelContext = { registerTool: (tool: { name:string; description:string; inputSchema:object; annotations:{readOnlyHint:false}; execute:()=>Promise<object> }, options?:{signal?:AbortSignal}) => void };
export function registerMealTools(draw:()=>Promise<{id:string;name:string}>, signal:AbortSignal):void {
  if (typeof document === "undefined") return;
  const modelContext = (document as Document & {modelContext?:ModelContext}).modelContext;
  if (!modelContext?.registerTool) return;
  modelContext.registerTool({
    name:"draw_meal_with_current_settings",
    description:"現在画面に表示されているモード、条件、除外、希望人数、抽選方式をそのまま使って食事候補を1件抽選します。",
    inputSchema:{type:"object",properties:{},additionalProperties:false},
    annotations:{readOnlyHint:false},
    execute:async()=>{ const result=await draw(); return {status:"drawn",candidateId:result.id,candidateName:result.name}; },
  },{signal});
}
