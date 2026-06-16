import { Rocket, Clock } from 'lucide-react';

export default function LoansPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="relative inline-flex">
          <div className="absolute inset-0 bg-purple-200 rounded-full blur-2xl opacity-30 animate-pulse" />
          <div className="relative h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center border-2 border-purple-200">
            <Rocket className="h-12 w-12 text-[#920793]" />
          </div>
        </div>

       
        <div className="space-y-2">
          <h1 className="text-[28px] font-black text-gray-900">
            Loans Coming Soon
          </h1>
          <p className="text-[14px] text-gray-500 leading-relaxed">
            We're building something amazing! Loan applications and management features will be available soon.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-200">
          <Clock className="h-4 w-4 text-[#920793]" />
          <span className="text-[13px] font-semibold text-[#920793]">
            In Development
          </span>
        </div>
      </div>
    </div>
  );
}
