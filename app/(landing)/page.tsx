import { LandingNavbar } from "@/components/landingnavbar";
import { LandingHero } from "@/components/landinghero";
import { LandingContent } from "@/components/landingcontent";


const LandingPage = () => {
  return ( 
    <div className="h-full ">
      <LandingNavbar />
      <LandingHero />
      <LandingContent />
    </div>
   );
}
 
export default LandingPage;