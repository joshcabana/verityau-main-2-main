import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/motion";

const FAQ = () => {
  return (
    <div className="min-h-screen bg-[hsl(var(--ink))]">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-20 sm:py-24 md:py-32">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-8 -ml-2 text-white hover:text-accent hover:bg-white/5 transition-smooth">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <ScrollReveal>
          <div className="max-w-4xl mx-auto">
            <h1 className="section-header text-3xl md:text-5xl lg:text-6xl text-center mb-8 text-white">
              Verity FAQ: The No-Bullshit Guide to Actually Dating
            </h1>

            <p className="text-lg text-white/80 text-center mb-16 leading-relaxed max-w-3xl mx-auto">
              We get it — dating apps come with more fine print than a gym membership. Here's the raw truth on how Verity works, why it's different, and what happens if it all goes sideways. No legalese, no fluff. Just facts, a dash of sarcasm, and the occasional reality check. (Stats from our beta and sources like Pew/YouGov AU, 2025.)
            </p>

            <StaggerContainer className="space-y-8" staggerDelay="fast">
              <StaggerItem>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    How Does Verity Work? (The 10-Second Lowdown)
                  </h3>
                  <p className="text-accent font-semibold text-lg mb-3">
                    Short Answer: Mutual interest → 10-minute video date → spark? Chat unlocks. Dud? Dip out gracefully. No swipes, no endless "heys."
                  </p>
                  <p className="text-white/70 leading-relaxed">
                    The Brutal Details: Forget the swipe circus. You build a verified profile (photos, bio, 30-second intro video — no filters, or you're out). Browse nearby folks who match your prefs (age, distance, gender). Like back? Boom — you're in a video call. Timer ticks, icebreakers prompt the awkward ("Worst date story?"), and you see if the laugh is real or rehearsed. Both feel it? Chat opens for the real plan. One doesn't? "Parted ways respectfully" — no ghosts, no grudges. Factual: Beta users report 3x more IRL meetups, because 10 minutes outs the fakers faster than 10 weeks of texting.
                  </p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Is Verity Safe? (Because No One Trusts Apps Anymore)
                  </h3>
                  <p className="text-accent font-semibold text-lg mb-3">
                    Short Answer: Safer than your ex's promises. Video verification, instant reports, and 24-hour moderation. 92% of beta users felt more secure than on other apps.
                  </p>
                  <p className="text-white/70 leading-relaxed">
                    The Honest Breakdown: We don't mess around. Every profile requires a 5-second selfie wave (AI checks it's you, not your cousin's dog). Calls are end-to-end encrypted — no recording, no screenshots without consent. Spot a creep? One-tap report (reasons: harassment, spam, underage vibes) saves to our moderated queue. Blocks hide them forever from your feed. Factual: 78% less ghosting in beta, because you can't vanish after a face-to-face flop. We're AU-based, Privacy Act-compliant, and partner with women's safety orgs — 10% of Plus revenue goes there. Still sketched? Our terms/privacy are plain English, not lawyer bingo.
                  </p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    What's the Catch? (Freemium or Free-for-All?)
                  </h3>
                  <p className="text-accent font-semibold text-lg mb-3">
                    Short Answer: Free for 5 dates/week. Plus ($24.99/mo) for unlimited, priority matching, and undo swipes. No ads, no data sales — ever.
                  </p>
                  <p className="text-white/70 leading-relaxed">
                    The No-Nonsense Truth: We're not here to nickel-and-dime you like Tinder's "Boosts for $9.99." Free tier lets you test the waters (5 dates/week, standard queue). Plus unlocks abundance: unlimited dates, see who liked you first, and that sweet "rewind" for the swipe regret. Factual: 20% conversion in beta — users pay because it works (3x more matches). Cancel anytime, no contracts. Trial? First 2,000 waitlisters get lifetime free. Catch? You have to be real — no fakes allowed.
                  </p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Do I Need to Be Camera-Ready? (The "I'm Shy" Disclaimer)
                  </h3>
                  <p className="text-accent font-semibold text-lg mb-3">
                    Short Answer: No one's expecting Oscar makeup. Casual sweater, bedhead OK — authenticity is the point.
                  </p>
                  <p className="text-white/70 leading-relaxed">
                    The Relatable Reality: 68% of users say video dates feel "less awkward than texting" (our beta survey). It's 10 minutes, not a photoshoot. Prompts like "Worst date story?" break the ice, and you can mute/turn off camera if nerves hit. Shy? Practice with the intro video (30 seconds, private). Factual: Non-binary and introvert users report 85% more confidence post-call — because seeing the human behind the profile cuts the mystery. Pro tip: Golden hour lighting forgives all sins.
                  </p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    How's Matching Work? (No Algorithms, Just Logic)
                  </h3>
                  <p className="text-accent font-semibold text-lg mb-3">
                    Short Answer: Proximity + prefs = your queue. No black-box AI deciding your fate.
                  </p>
                  <p className="text-white/70 leading-relaxed">
                    The Transparent Take: We match verified folks within your radius (default 100km — adjust for road trips). Prefs (age, gender, "serious or casual") filter the noise. Like back? Mutual magic. No "Elo score" bullshit — it's you + them + geography. Factual: PostGIS ensures less than 5km waits in Canberra, 78% first-call conversion to chats. Want more control? Plus gives "priority" (your profile tops queues).
                  </p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    What If It Sucks? (Our Suck-Free Guarantee)
                  </h3>
                  <p className="text-accent font-semibold text-lg mb-3">
                    Short Answer: It won't — but if it does, we're listening. 30-day refund on Plus, easy unmatch.
                  </p>
                  <p className="text-white/70 leading-relaxed">
                    The Unvarnished Version: Dating sucks sometimes. If Verity flops for you (e.g., no sparks in Week 1), hit feedback — we iterate fast (beta users shaped 40% of features). Factual: 87% retention after first date (vs. Tinder's 25%). Unmatch anytime, delete data GDPR-style. Sucks guarantee? First 500 beta users get a "do-over" month free. We're in this circus together.
                  </p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Still Got Questions? (The Catch-All)
                  </h3>
                  <p className="text-white/70 leading-relaxed mb-4">
                    Drop us a line at{" "}
                    <a href="mailto:hello@verity.au" className="text-accent hover:text-accent/80 transition-smooth font-semibold">
                      hello@verity.au
                    </a>{" "}
                    — we're Canberra locals, not bots. No query too dumb (promise — we've heard 'em all).
                  </p>
                  <p className="text-white/60 italic text-center">
                    Verity: Because real is the new rare. © 2025, Made with Frustration and a Dash of Hope in Canberra.
                  </p>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </ScrollReveal>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10 bg-[hsl(var(--ink))]">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-white/40">
          <Link to="/" className="hover:text-accent transition-colors">
            ← Back to home
          </Link>
          <span>Verity © 2025</span>
        </div>
      </footer>
    </div>
  );
};

export default FAQ;
