import { redirect } from "next/navigation";
import { getUserOnboardingStatus } from "../../../actions/user";
import { getIndustryInsights } from "../../../actions/dashboard";
import DashboardView from "./_components/dashboard-view";

const IndustryInsightsPage = async () => {
    console.log("🚀 Dashboard page loading...");
    
    
    try {
        const { isOnboarded, user } = await getUserOnboardingStatus();
        
        console.log("🔍 Dashboard check - isOnboarded:", isOnboarded);
        console.log("🔍 User data:", user);
        
        if (!isOnboarded) {
            console.log("❌ User not onboarded, redirecting to onboarding");
            redirect("/onboarding");
        }
        
        console.log("✅ User is onboarded, loading insights...");
        
        // Only get insights if user is onboarded
        const insights = await getIndustryInsights();
        
        console.log("✅ Insights loaded successfully");
        
        return (
            <div className="container mx-auto">
                <DashboardView insights={insights}/>
            </div>
        );
    } catch (error) {
        console.error("❌ Dashboard page error:", error);
        // If there's any error, redirect to onboarding to be safe
        redirect("/onboarding");
    }
};

export default IndustryInsightsPage;