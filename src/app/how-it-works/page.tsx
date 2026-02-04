import Link from 'next/link';
import {
  MessageSquare,
  Zap,
  Search,
  Calendar,
  Wrench,
  CheckCircle,
  ArrowRight,
  Bot,
  Shield,
  Clock
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How Fixly Works
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get your items repaired in 4 simple steps with the power of AI-driven diagnostics
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            <Step
              number={1}
              icon={<MessageSquare className="h-8 w-8" />}
              title="Describe Your Problem"
              description="Tell us what's broken. Describe the symptoms, when it started, and any relevant details. You can also upload photos to help with the diagnosis."
              features={[
                'Support for all repair categories',
                'Photo upload capability',
                'Detailed symptom logging',
              ]}
              imagePosition="right"
            />

            <Step
              number={2}
              icon={<Bot className="h-8 w-8" />}
              title="Get AI-Powered Diagnosis"
              description="Our advanced AI analyzes your problem and provides an instant diagnosis with estimated repair costs, possible causes, and recommended actions."
              features={[
                'Instant AI analysis',
                'Accurate cost estimates',
                'DIY instructions when applicable',
              ]}
              imagePosition="left"
            />

            <Step
              number={3}
              icon={<Search className="h-8 w-8" />}
              title="Find the Right Shop"
              description="Browse verified repair shops in your area. Compare ratings, reviews, specialties, and pricing to find the perfect match for your repair needs."
              features={[
                'Verified shop network',
                'Real customer reviews',
                'Transparent pricing',
              ]}
              imagePosition="right"
            />

            <Step
              number={4}
              icon={<Wrench className="h-8 w-8" />}
              title="Get It Fixed"
              description="Schedule your repair, track progress in real-time, and communicate with the shop through our platform. Pay securely when the job is done."
              features={[
                'Real-time progress tracking',
                'Direct messaging with shops',
                'Secure payment processing',
              ]}
              imagePosition="left"
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Customers Love Fixly
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-primary-600" />}
              title="Instant Diagnosis"
              description="Get an AI-powered diagnosis in seconds, not days. Know what's wrong and how much it'll cost before visiting a shop."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-primary-600" />}
              title="Verified Shops"
              description="Every shop on our platform is verified and reviewed. We ensure quality service and fair pricing."
            />
            <FeatureCard
              icon={<Clock className="h-6 w-6 text-primary-600" />}
              title="Save Time"
              description="No more calling multiple shops for quotes. Compare prices and availability all in one place."
            />
            <FeatureCard
              icon={<MessageSquare className="h-6 w-6 text-primary-600" />}
              title="AI Chat Support"
              description="Have questions? Our AI assistant is available 24/7 to help with your repair inquiries."
            />
            <FeatureCard
              icon={<Calendar className="h-6 w-6 text-primary-600" />}
              title="Easy Scheduling"
              description="Book appointments online at your convenience. Reschedule or cancel with just a few clicks."
            />
            <FeatureCard
              icon={<CheckCircle className="h-6 w-6 text-primary-600" />}
              title="Quality Guarantee"
              description="All repairs come with a satisfaction guarantee. We stand behind the work of our partner shops."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Create your free account and get an instant diagnosis for your repair needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/repairs/new"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors inline-flex items-center justify-center"
            >
              Start a Repair Request
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/auth/register"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Step({
  number,
  icon,
  title,
  description,
  features,
  imagePosition,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  imagePosition: 'left' | 'right';
}) {
  const content = (
    <div className={`lg:w-1/2 ${imagePosition === 'left' ? 'lg:pl-12' : 'lg:pr-12'}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600">
          {icon}
        </div>
        <span className="text-sm font-medium text-primary-600">Step {number}</span>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <ul className="space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const placeholder = (
    <div className="lg:w-1/2">
      <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
        <div className="text-primary-600">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row items-center gap-12">
      {imagePosition === 'left' ? (
        <>
          {placeholder}
          {content}
        </>
      ) : (
        <>
          {content}
          {placeholder}
        </>
      )}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-50 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
