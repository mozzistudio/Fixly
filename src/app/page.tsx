import Link from 'next/link';
import { Wrench, Zap, Shield, MessageSquare, Star, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight">
              AI-Powered Repairs,{' '}
              <span className="text-primary-600">Made Simple</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              Get instant AI diagnostics for your repair needs, connect with trusted local shops,
              and track your repairs from start to finish.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/repairs/new" className="btn-primary text-lg px-8 py-3 flex items-center justify-center">
                Start a Repair Request
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/how-it-works" className="btn-secondary text-lg px-8 py-3">
                Learn How It Works
              </Link>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-100 rounded-full blur-3xl opacity-30" />
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Choose Fixly?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              The smarter way to handle repairs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Zap className="h-8 w-8 text-primary-600" />}
              title="Instant AI Diagnosis"
              description="Describe your issue and get an AI-powered diagnosis with estimated costs in seconds."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-primary-600" />}
              title="Verified Shops"
              description="Connect with trusted, verified repair shops in your area with transparent pricing."
            />
            <FeatureCard
              icon={<MessageSquare className="h-8 w-8 text-primary-600" />}
              title="AI Chat Support"
              description="Get answers to your repair questions 24/7 with our intelligent AI assistant."
            />
            <FeatureCard
              icon={<Star className="h-8 w-8 text-primary-600" />}
              title="Real Reviews"
              description="Read authentic reviews from real customers to find the best repair shop."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Three simple steps to get your items repaired
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <StepCard
              number="1"
              title="Describe Your Problem"
              description="Tell us what needs fixing. Upload photos if you have them for a more accurate diagnosis."
            />
            <StepCard
              number="2"
              title="Get AI Diagnosis"
              description="Our AI analyzes your issue and provides a diagnosis with estimated repair costs."
            />
            <StepCard
              number="3"
              title="Connect & Repair"
              description="Choose a local repair shop, schedule your repair, and track progress in real-time."
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              What We Repair
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              From electronics to appliances, we've got you covered
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              'Smartphones',
              'Laptops',
              'Tablets',
              'TVs',
              'Appliances',
              'HVAC',
              'Plumbing',
              'Electrical',
              'Automotive',
              'Desktops',
              'Gaming',
              'More...',
            ].map((category) => (
              <div
                key={category}
                className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <span className="text-gray-700 font-medium">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-xl text-primary-100">
            Join thousands of satisfied customers who trust Fixly for their repairs.
          </p>
          <div className="mt-10">
            <Link
              href="/auth/register"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors inline-flex items-center"
            >
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Wrench className="h-6 w-6 text-white" />
              <span className="text-white font-bold text-lg">Fixly</span>
            </div>
            <div className="flex space-x-8 text-gray-400 text-sm">
              <Link href="/about" className="hover:text-white">About</Link>
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <Link href="/contact" className="hover:text-white">Contact</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Fixly. All rights reserved.
          </div>
        </div>
      </footer>
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
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold text-xl mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
