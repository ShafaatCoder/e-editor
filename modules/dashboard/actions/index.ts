"use server"

import { currentUser } from "@/modules/auth/actions"
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import DashboardLayout from "@/app/dashboard/layout";

export const toggleStarMarked = async (playgroundId:string,isChecked:boolean) => {
    
    const user = await currentUser();
    const userId  = user?.id;

    if(!userId){
        throw new Error("User not authenticated");
    }

    try{
        if(isChecked){
            await db.starMark.create({
                data:{
                    userId:userId!,
                    playgroundId,
                    isMarked: isChecked
                },
            });
        }else{
            await db.starMark.delete({
                where:{
                    userId_playgroundId:{
                        userId:userId!,
                        playgroundId:playgroundId,
                    },
                },
            });
        }
        revalidatePath("/dashboard");
        return {success:true,isMarked:isChecked};
    }catch(error){
        console.log(error);
        return {success:false,error:"Failed to toggle mark for revision",isMarked:!isChecked};
    }


}

export const getAllPlaygroundForUser = async()=> {
    const user = await  currentUser();
    try{
        const playground = await db.playground.findMany({
            where:{
                userId:user?.id
            },
            include:{
                user:true,
                Starmark:{
                    where:{
                        userId:user?.id!
                    },
                    select:{
                        isMarked:true
                    },
                },
            },
        });
        return playground;
    }
    catch(error){
        console.log(error);
        return null;

    }
}

export const createPlayground = async (data:
    {
        title:string,
        template: "REACT" | "NEXTJS" | "EXPRESS" | "ANGULAR" | "VUE" | "HONO",
        description: string
    }
)=>{
    const user = await currentUser();
    const {template,title,description} = data;
    try{
        const playground = await db.playground.create({
            data:{
                title:title,
                template:template,
                description:description,
                userId:user?.id!
            }
        })
        return playground;

    }catch(error){
        console.log(error);
        return  null;
    }
}

export const deleteProjectById = async (id:string)=>{
    try{
        await db.playground.delete({
            where:{
                id
            }
        })
       revalidatePath("/dashboard");
    }
    catch(error){
        console.log(error);
        return null;
    }
}

export const editProjectById = async (id:string,data:{
    title:string,
    descritpion:string
})=>{
    try {
        await db.playground.update({
            where:{
                id
            },
            data:data
        })
        revalidatePath("/dashboard");
        
    } catch (error) {
        console.log(error);
    }
}

export const duplicateProjectbyId = async (id:string)=>{
    try{
        const project  = await db.playground.findUnique({
            where:{
                id
            }
        })
        if(!project) throw new Error("Invalid Project ID");
        const duplicatedProject = await db.playground.create({
                data:{
                    title:`${project.title} (Copy)`,
                    description:project.description,
                    template:project.template,
                    userId:project.userId
                }
            })
        revalidatePath("/dashboard");
        return duplicatedProject;
    }catch(error){
        console.log(error);
    }
}