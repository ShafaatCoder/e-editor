import { SidebarProvider } from "@/components/ui/sidebar";
import { getAllPlaygroundForUser } from "@/modules/dashboard/actions";
import { DashboardSidebar } from "@/modules/dashboard/components/dashboard-sidebar";
export default async function DashboardLayout({
    children
}:{
    children:React.ReactNode
}){
        const playgroundData = await getAllPlaygroundForUser();
        const techIconMap: Record<string,string>={
            REACT:"Zap",
            NEXTJS:"Lightbulb",
            EXPRESS:"Database",
            HONO:"FlameIcon",
            VUE:"Compass",
            ANGULAR:"Terminal",
        }

        const formmatedPlaygroundData = playgroundData?.map((item)=>({
            id:item.id,
            name:item.title,
            starred:false,
            icon:techIconMap[item.template] || "Code2",
        }))
    return (

    <SidebarProvider>
            <div className="flex min-h-screen w-full overflow-x-hidden">
                //Dashboard
                /* @ts-ignore */
                <DashboardSidebar initialPlaygroundData={formmatedPlaygroundData}/>
                <main className="flex-1">
                    {children}
                </main>

            </div>
        </SidebarProvider>
    )
}