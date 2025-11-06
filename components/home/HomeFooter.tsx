'use client';

import Link from "next/link";
import Image from "next/image";
import { useTypedTranslation } from "@/lib/i18n";

export function HomeFooter() {
  const { tPages } = useTypedTranslation();

  return (
    <footer className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Separador visual */}
      <div className="border-t border-gray-200 dark:border-gray-700"></div>
      
      <div className="max-w-7xl mx-auto px-5 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Image 
                src="/images/rotom-image.png" 
                alt="RotomTracks Logo" 
                width={24} 
                height={24}
                className="h-6 w-6"
              />
              <span className="text-xl font-bold">RotomTracks</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6" dangerouslySetInnerHTML={{ __html: tPages('home.footer.description') }}>
            </p>
          </div>
          
          {/* Support Section */}
          <div className="md:col-span-1 md:text-center">
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">{tPages('home.footer.support')}</h4>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/help" className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                  {tPages('home.footer.help')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                  {tPages('home.footer.contact')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                  {tPages('home.footer.terms')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                  {tPages('home.footer.privacy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {tPages('home.footer.copyright')}
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <span>Made with ❤️ for the Pokémon community</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
