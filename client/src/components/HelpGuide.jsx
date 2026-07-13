import { useState } from "react";
import { HelpCircle, X, Search } from "lucide-react";

const NAVY = "#1B2A56";

const FAQS = [
  {
    keywords: ["book", "booking", "slot", "how to book", "reserve"],
    question: "How do I book a charging slot?",
    answer: "Go to Stations, click 'View Slots' on any station card, pick a date, then click an available (green) time slot. A confirmation popup will appear — click 'Book slot' to finish.",
  },
  {
    keywords: ["cancel", "cancelling", "cancellation"],
    question: "How do I cancel a booking?",
    answer: "Go to My Bookings, find your upcoming booking, click the ⋮ (three dots) button, then 'Cancel Booking'. Confirm in the popup that appears — your slot will become available again for others.",
  },
  {
    keywords: ["charged", "mark as charged", "complete", "done charging", "finish"],
    question: "What does 'Mark as Charged' do?",
    answer: "Once you're done charging, go to My Bookings, click the ⋮ button on your booking, then 'Mark as Charged'. This instantly frees up that slot so the next person can book it, even if the original time window hasn't ended yet.",
  },
  {
    keywords: ["map", "marker", "green", "red", "color", "colour"],
    question: "What do the map colors mean?",
    answer: "Green markers mean the station still has available slots today. Red markers mean the station is fully booked for today. Click any marker for more details.",
  },
  {
    keywords: ["nearest", "location", "distance", "near me", "close"],
    question: "How do I find the station nearest to me?",
    answer: "Click 'Use my location' in the filters bar on the Stations page. Once you allow location access, a 'Sort by nearest' option appears — check it to reorder stations by distance from you.",
  },
  {
    keywords: ["suggestion", "assistant", "ai", "recommend", "suggest"],
    question: "How does the Charging Assistant suggestion work?",
    answer: "Enter your EV model, current battery %, your current city, and optionally your destination. Click 'Get suggestion' and you'll get a recommendation on which station to charge at and why — based on your battery level and route.",
  },
  {
    keywords: ["cost", "price", "calculator", "estimate", "how much"],
    question: "How do I estimate charging cost?",
    answer: "Open any station's detail page — there's a 'Estimate charging cost' card with a slider. Drag it to the battery % you need, and it'll show the estimated kWh and cost based on your EV and that station's charger type.",
  },
  {
    keywords: ["profile", "edit", "name", "ev model", "update"],
    question: "How do I update my profile or EV model?",
    answer: "Go to Profile from the sidebar. You can edit your name and EV model there, then click 'Save changes'.",
  },
  {
    keywords: ["stats", "history", "savings", "kwh", "spent"],
    question: "Where can I see my charging history and savings?",
    answer: "Your Profile page shows a stats section — total charging sessions, total kWh charged, total spent, and estimated savings compared to petrol, based on your completed charging sessions.",
  },
  {
    keywords: ["logout", "log out", "sign out"],
    question: "How do I log out?",
    answer: "Click 'Logout' at the bottom of the sidebar. You'll be asked to confirm before you're actually logged out.",
  },
  {
    keywords: ["sidebar", "menu", "collapse", "hide"],
    question: "How do I collapse or hide the sidebar?",
    answer: "Click the menu button (☰) at the top of the page. On larger screens it collapses to icon-only; on smaller screens it hides completely with a tap-to-close overlay.",
  },
];

export default function HelpGuide() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const filteredFaqs = query.trim()
    ? FAQS.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query.toLowerCase()) ||
          faq.keywords.some((k) => k.includes(query.toLowerCase()) || query.toLowerCase().includes(k))
      )
    : FAQS;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg z-50 cursor-pointer"
        style={{ backgroundColor: NAVY }}
        aria-label="Open help guide"
      >
        <HelpCircle size={22} />
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end px-0 sm:px-6 sm:pb-6">
          <div
            className="fixed inset-0 bg-black/30 cursor-pointer"
            onClick={() => { setOpen(false); setSelected(null); setQuery(""); }}
          />
          <div className="relative bg-white rounded-t-xl sm:rounded-xl w-full sm:w-96 max-h-[80vh] sm:max-h-[520px] flex flex-col shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-2">
                <HelpCircle size={16} style={{ color: NAVY }} />
                <span className="text-sm font-medium">Help Guide</span>
              </div>
              <button
                onClick={() => { setOpen(false); setSelected(null); setQuery(""); }}
                className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {selected ? (
              /* Answer view */
              <div className="flex-1 overflow-y-auto p-4">
                <button
                  onClick={() => setSelected(null)}
                  className="text-xs text-gray-500 mb-3 cursor-pointer"
                >
                  ← Back to questions
                </button>
                <p className="text-sm font-medium mb-2">{selected.question}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{selected.answer}</p>
              </div>
            ) : (
              <>
                {/* Search */}
                <div className="p-3 border-b border-gray-200 shrink-0">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search for help, e.g. 'cancel booking'"
                      className="w-full h-9 pl-9 pr-3 rounded-md border border-gray-300 text-sm"
                    />
                  </div>
                </div>

                {/* Question list */}
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
                  {filteredFaqs.length === 0 ? (
                    <p className="text-sm text-gray-500 px-2 py-4 text-center">
                      No matching questions. Try different words.
                    </p>
                  ) : (
                    filteredFaqs.map((faq) => (
                      <button
                        key={faq.question}
                        onClick={() => setSelected(faq)}
                        className="text-left text-sm px-3 py-2.5 rounded-md hover:bg-gray-50 cursor-pointer"
                      >
                        {faq.question}
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}