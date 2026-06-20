import { Check, Sparkles, Zap } from 'lucide-react'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    color: 'border-gray-200',
    features: ['3 resume templates', 'Basic AI suggestions', 'PDF export', '1 active resume'],
    cta: 'Current Plan',
    disabled: true,
  },
  {
    name: 'Premium',
    price: '$9',
    period: 'per month',
    color: 'border-blue-500 ring-2 ring-blue-100',
    badge: 'Most Popular',
    features: ['All 10 templates', 'Full AI CV Scanner', 'Unlimited resumes', 'Priority support', 'Custom branding', 'Public resume link'],
    cta: 'Upgrade Now',
    disabled: false,
  },
]

export default function PaymentsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-black text-gray-900 mb-2">Choose your plan</h1>
        <p className="text-gray-500">Upgrade to unlock all templates and AI-powered features</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PLANS.map((plan) => (
          <div key={plan.name} className={`bg-white rounded-2xl border-2 ${plan.color} p-6 relative`}>
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                <Sparkles size={11} /> {plan.badge}
              </div>
            )}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900">{plan.name}</h2>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                <span className="text-gray-400 text-sm">/{plan.period}</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-green-600" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <button
              disabled={plan.disabled}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                plan.disabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
              }`}
            >
              {!plan.disabled && <Zap size={16} />}
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">
        Payment integration coming soon. Secure billing powered by Stripe.
      </p>
    </div>
  )
}
