"use client"
import { ArrowRight, GraduationCap, FileText, Files, MapPin } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Step {
  id: number;
  title: string;
  desc: string;
  icon: React.ReactNode;
  href: string;
}

export default function StepsGrid() {
    const params = useParams();
  const studentId = params.id; 
  const steps: Step[] = [
    {
      id: 1,
      title: "Step 1",
      desc: "Fill in application form",
      icon: <FileText className="text-indigo-500 w-6 h-6" />,
      href: `/partner/students/${studentId}/application-form`,
    },
    // {
    //   id: 2,
    //   title: "Step 2",
    //   desc: "Document list",
    //   icon: <Files className="text-indigo-500 w-6 h-6" />,
    //   href: `/partner/students/${studentId}/documents`,
    // },
    {
      id: 2,
      title: "Step 2",
      desc: "Apply",
      icon: <GraduationCap className="text-indigo-500 w-6 h-6" />,
      href: `/partner/students/${studentId}/apply`,
    },
    {
      id: 3,
      title: "Step 3",
      desc: "Track application progress",
      icon: <MapPin className="text-indigo-500 w-6 h-6" />,
      href: `/partner/students/${studentId}/applications`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mx-auto">
      {steps.map((step) => (
        <Link
          key={step.id}
          href={step.href}
          className="group cursor-pointer flex flex-col justify-between hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900 rounded-2xl shadow-md p-5 border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-600  hover:-translate-y-1"
        >
          <div>
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-100  transition-all duration-300">
              {step.icon}
            </div>
            <h3 className="text-indigo-700 font-semibold text-lg mb-1 group-hover:text-indigo-800  transition-all duration-300">
              {step.title}
            </h3>
            <p className="text-gray-600 dark:text-white text-sm group-hover:text-gray-800 dark:group-hover:text-gray-200  transition-all duration-300">
              {step.desc}
            </p>
          </div>
          <div className="flex justify-end mt-4">
            <ArrowRight className="text-indigo-500 w-4 h-4 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
          </div>
        </Link>
      ))}
    </div>
  );
}