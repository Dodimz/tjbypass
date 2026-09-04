import type React from 'react';
import BestCourse from '@/frontend/page-jsx/dynamic/best-course';
import CourseSearchInput from '@/frontend/page-jsx/dynamic/course-search-input';
import EmailSubscribeInput from '@/frontend/page-jsx/dynamic/email-subscribe-input';
import FinalCtaBanner from '@/frontend/page-jsx/dynamic/final-cta-banner';
import NewBlogsCarousel from '@/frontend/page-jsx/dynamic/new-blogs-carousel';
import NewCourses1 from '@/frontend/page-jsx/dynamic/new-courses-1';
import NewCoursesCarousel1 from '@/frontend/page-jsx/dynamic/new-courses-carousel-1';
import ServicesCarousel1 from '@/frontend/page-jsx/dynamic/services-carousel-1';
import ServicesGrid1 from '@/frontend/page-jsx/dynamic/services-grid-1';
import TopCourseCategories1 from '@/frontend/page-jsx/dynamic/top-course-categories-1';
import TopCourseCategories2 from '@/frontend/page-jsx/dynamic/top-course-categories-2';
import TopCourseCategories3 from '@/frontend/page-jsx/dynamic/top-course-categories-3';
import TopCourseCategories4 from '@/frontend/page-jsx/dynamic/top-course-categories-4';
import TopCourseCategories5 from '@/frontend/page-jsx/dynamic/top-course-categories-5';
import TopCourseCategories6 from '@/frontend/page-jsx/dynamic/top-course-categories-6';
import TopCourses1 from '@/frontend/page-jsx/dynamic/top-courses-1';
import TopCoursesCarousel1 from '@/frontend/page-jsx/dynamic/top-courses-carousel-1';
import TopInstructorsCarousel1 from '@/frontend/page-jsx/dynamic/top-instructors-carousel-1';
import TopInstructorsCarousel2 from '@/frontend/page-jsx/dynamic/top-instructors-carousel-2';
import TopSponsorsCarousel1 from '@/frontend/page-jsx/dynamic/top-sponsors-carousel-1';
import TopTestimonialsCarousel1 from '@/frontend/page-jsx/dynamic/top-testimonials-carousel-1';
import TopTestimonialsCarousel2 from '@/frontend/page-jsx/dynamic/top-testimonials-carousel-2';
import TrustSignals from '@/frontend/page-jsx/dynamic/trust-signals';

/**
 * Registry for dynamic components that can be used in EditorDynamicWrapper
 * These components preserve their full React functionality (state, effects, etc.)
 * and are NOT serialized to JSON.
 *
 * IMPORTANT: Components must use regular HTML/React elements, NOT Editor components
 * (EditorSection, EditorDiv, etc.) which are only JSX placeholders.
 */
export const DYNAMIC_COMPONENTS: Record<string, React.ComponentType<any>> = {
   'best-course': BestCourse,
   'new-blogs-carousel': NewBlogsCarousel,
   'top-courses-1': TopCourses1,
   'new-courses-1': NewCourses1,
   'new-courses-carousel-1': NewCoursesCarousel1,
   'services-grid-1': ServicesGrid1,
   'services-carousel-1': ServicesCarousel1,
   'top-courses-carousel-1': TopCoursesCarousel1,
   'top-instructors-carousel-1': TopInstructorsCarousel1,
   'top-instructors-carousel-2': TopInstructorsCarousel2,
   'top-course-categories-1': TopCourseCategories1,
   'top-course-categories-2': TopCourseCategories2,
   'top-course-categories-3': TopCourseCategories3,
   'top-course-categories-4': TopCourseCategories4,
   'top-course-categories-5': TopCourseCategories5,
   'top-course-categories-6': TopCourseCategories6,
   'course-search-input': CourseSearchInput,
   'email-subscribe-input': EmailSubscribeInput,
   'final-cta-banner': FinalCtaBanner,
   'top-testimonials-carousel-1': TopTestimonialsCarousel1,
   'top-testimonials-carousel-2': TopTestimonialsCarousel2,
   'top-sponsors-carousel-1': TopSponsorsCarousel1,
   'trust-signals': TrustSignals,
   // Add more components as needed
};

/**
 * Field schema for editable dynamic components.
 * Each field is rendered as an input in the editor Customize tab and
 * stored in element.content.fields[key]. Components merge these values
 * over their built-in defaults, so empty fields fall back gracefully.
 */
export type DynamicFieldDef = {
   key: string;
   label: string;
   type?: 'text' | 'textarea';
   placeholder?: string;
};

export const DYNAMIC_COMPONENT_FIELDS: Record<string, DynamicFieldDef[]> = {
   'trust-signals': [
      { key: 'heading', label: 'Judul Section' },
      { key: 'subheading', label: 'Subjudul', type: 'textarea' },
      { key: 'feature_1_title', label: 'Fitur 1 - Judul' },
      {
         key: 'feature_1_description',
         label: 'Fitur 1 - Deskripsi',
         type: 'textarea',
      },
      { key: 'feature_2_title', label: 'Fitur 2 - Judul' },
      {
         key: 'feature_2_description',
         label: 'Fitur 2 - Deskripsi',
         type: 'textarea',
      },
      { key: 'feature_3_title', label: 'Fitur 3 - Judul' },
      {
         key: 'feature_3_description',
         label: 'Fitur 3 - Deskripsi',
         type: 'textarea',
      },
      { key: 'feature_4_title', label: 'Fitur 4 - Judul' },
      {
         key: 'feature_4_description',
         label: 'Fitur 4 - Deskripsi',
         type: 'textarea',
      },
      { key: 'avatar_1_url', label: 'URL Foto Avatar 1' },
      { key: 'avatar_2_url', label: 'URL Foto Avatar 2' },
      { key: 'avatar_3_url', label: 'URL Foto Avatar 3' },
      { key: 'avatars_badge', label: 'Badge Jumlah Avatar (mis. +5k)' },
      { key: 'banner_text', label: 'Teks Banner Kepercayaan' },
   ],
   'final-cta-banner': [
      { key: 'title', label: 'Judul CTA' },
      { key: 'subtitle', label: 'Subjudul CTA', type: 'textarea' },
      { key: 'whatsapp_label', label: 'Label Tombol WhatsApp' },
      { key: 'whatsapp_url', label: 'Link WhatsApp (https://wa.me/...)' },
      { key: 'phone_label', label: 'Label Tombol Telepon' },
      { key: 'phone_number', label: 'Nomor Telepon (format tel:+62...)' },
      { key: 'address_title', label: 'Judul Alamat' },
      {
         key: 'address_lines',
         label: 'Alamat (enter = baris baru)',
         type: 'textarea',
      },
      { key: 'hours_title', label: 'Judul Jam Operasional' },
      {
         key: 'hours_lines',
         label: 'Jam Operasional (enter = baris baru)',
         type: 'textarea',
      },
   ],
};

/**
 * Get a component from the registry by its reference key
 */
export const getDynamicComponent = (
   componentRef: string,
): React.ComponentType<any> | null => {
   try {
      return DYNAMIC_COMPONENTS[componentRef] || null;
   } catch (error) {
      console.error('Error getting dynamic component:', error);

      return null;
   }
};

/**
 * Get all available component references
 */
export const getAvailableComponents = (): string[] => {
   return Object.keys(DYNAMIC_COMPONENTS);
};

/**
 * Check if a component reference exists in the registry
 */
export const hasComponent = (componentRef: string): boolean => {
   return componentRef in DYNAMIC_COMPONENTS;
};
