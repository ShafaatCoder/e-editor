import { readTemplateStructureFromJson,saveTemplateStructureToJson } from "@/modules/playgrounds/lib/pathToJson";
import { db } from "@/lib/db";
import { templatePath } from "@/lib/template";
import path from "path"
import  fs from "fs/promises"
import { NextRequest, NextResponse } from "next/server";

function validateJsonStructure(data: unknown): boolean {
    try{
        JSON.parse(JSON.stringify(data));
        return true;
    }catch(error){
        console.error("Invalid JSON structure:",error);
        return false;
    }
}
export async function GET(
    request: NextRequest,
    {params}:{params:Promise<{id:string}>}
){
    const {id} = await params;
    if(!id){
        return Response.json({error:"Missing playground id"},{status:400});
    }
    const playground = await db.playground.findUnique({
        where:{id}
    })
    if(!playground){
        return Response.json({error:`Playground with id ${id} not found`},{status:404});
    }

    const templateKey = playground.template as keyof typeof templatePath;
    const templateP = templatePath[templateKey];
    if(!templateP){
        return Response.json({error:`Template path for key ${templateKey} not found`},{status:500});
    }
    try{
        const inputPath = path.join(process.cwd(), templateP);
        const outputFile = path.join(process.cwd(),`output/${templateKey}.json`);
        await saveTemplateStructureToJson(inputPath,outputFile);
        
        const result = await readTemplateStructureFromJson(outputFile);
        if(!validateJsonStructure(result.items)){
            return Response.json({error:"Invalid JSON structure in template data"},{status:500});
        }
        await fs.unlink(outputFile);
        return Response.json({success:true,templateJson:result},{status:200});
    }catch(error){
        console.error("Error reading template structure:", error);
        return NextResponse.json({error:"Failed to read template structure"},{status:500});
    }
}