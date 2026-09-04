<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdatePageSectionRequest;
use App\Models\Page;
use App\Models\Setting;
use App\Services\JobCircularService;
use App\Services\PageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Modules\Course\Services\CourseCategoryService;
use Modules\Frontend\Models\ProjectPage;

class HomeController extends Controller
{
    public function __construct(
        protected PageService $pageService,
        protected JobCircularService $jobCircularService,
        protected CourseCategoryService $categoryService,
    ) {}

    public function index(Request $request)
    {
        if ((bool) app('system')->fields['frontend']) {
            $page = ProjectPage::where('type', 'home')
                ->where('status', true)
                ->select('id', 'title', 'slug', 'content', 'type', 'description', 'banner')
                ->first();

            $system = app('system');
            $siteName = $system->fields['name'] ?? 'Mentor Learning Management System';
            $metaTags = $this->generateMetaTags(
                title: $page->title ?? $siteName,
                description: $page->description ?? $system->fields['description'] ?? '',
                image: $page->banner ?? $system->fields['banner'] ?? '',
                type: 'website',
                system: $system
            );

            return Inertia::render('Frontend/index', [
                'type' => 'home',
                'page' => $page,
            ])->withViewData($metaTags);
        }

        $home = Setting::where('type', 'home_page')->first();
        $page = Page::where('id', $home->fields['page_id'])
            ->with(['sections' => function ($query) {
                $query->orderBy('sort', 'asc');
            }])
            ->first();
        $sections = $this->pageService->getPageSections($request->all(), $page);

        $system = app('system');
        $siteName = $system->fields['name'] ?? 'Mentor Learning Management System';
        $metaTags = $this->generateMetaTags(
            title: $siteName,
            description: $system->fields['description'] ?? '',
            image: $system->fields['banner'] ?? '',
            type: 'website',
            system: $system
        );

        return Inertia::render('intro/'.$page->slug, [
            'page' => $page,
            'type' => 'intro',
            ...$sections,
        ])->withViewData($metaTags);
    }

    public function demo(Request $request, string $slug)
    {
        if (app('system')->fields['frontend']) {
            return Inertia::render('404');
        }

        $page = $this->pageService->getPageBySlug($slug);
        $sections = $this->pageService->getPageSections($request->all(), $page);

        $system = app('system');
        $siteName = $system->fields['name'] ?? 'Mentor Learning Management System';
        $metaTags = $this->generateMetaTags(
            title: $page->title ?? $siteName,
            description: $page->description ?? $system->fields['description'] ?? '',
            image: $system->fields['banner'] ?? '',
            type: 'website',
            system: $system,
            canonicalUrl: url('/')
        );

        return Inertia::render('intro/'.$page->slug, [
            'page' => $page,
            'type' => 'demo',
            ...$sections,
        ])->withViewData($metaTags);
    }

    /**
     * Update the specified section in storage.
     */
    public function update_section(UpdatePageSectionRequest $request, string $id)
    {
        $section = $this->pageService->updatePageSection($id, $request->validated());

        return back()->with('success', "Section '{$section->name}' has been updated successfully");
    }

    /**
     * Update the specified section in storage.
     */
    public function sort_section(Request $request)
    {
        $this->pageService->sortPageSections($request->sortedData);

        return back()->with('success', 'Page sections is sorted successfully');
    }

    public function inner_page(Request $request)
    {
        if (app('system')->fields['frontend'] && $request->slug != 'careers') {
            $page = ProjectPage::where('type', 'inner')
                ->where('status', true)
                ->where('slug', $request->slug)
                ->with('project')
                ->first();

            if (! $page) {
                return Inertia::render('404');
            }

            $system = app('system');
            $siteName = $system->fields['name'] ?? 'Mentor Learning Management System';
            $metaTags = $this->generateMetaTags(
                title: $page->title,
                description: $page->description ?? $system->fields['description'] ?? '',
                image: $page->banner ?? $system->fields['banner'] ?? '',
                type: 'website',
                system: $system
            );

            return Inertia::render('Frontend/index', [
                'type' => 'inner',
                'page' => $page,
            ])->withViewData($metaTags);
        }

        $innerPages = $this->pageService->getActiveInnerPages();
        $validSlugs = $innerPages->pluck('slug')->toArray();

        // Check if the requested slug exists in inner pages
        if (! in_array($request->slug, $validSlugs)) {
            // abort(404);
            return Inertia::render('404');
        }

        $page = $this->pageService->getCustomPageBySlug($request->slug);
        $sections = $request->slug === 'careers' ? [] : $this->pageService->getPageSections($request->all(), $page);
        $jobCirculars = $request->slug === 'careers' ?
            $this->jobCircularService->getJobCirculars(array_merge($request->all(), [
                'paginate' => true,
                'select' => 'id,uuid,title,status,location,job_type,work_type,experience_level,positions_available,application_deadline',
            ])) : null;

        $system = app('system');
        $siteName = $system->fields['name'] ?? 'Mentor Learning Management System';
        $metaTags = $this->generateMetaTags(
            title: $page->name ?? $page->slug,
            description: $system->fields['description'] ?? '',
            image: $system->fields['banner'] ?? '',
            type: 'website',
            system: $system
        );

        return Inertia::render('inner/index', [
            'page' => $page,
            'jobCirculars' => $jobCirculars,
            ...$sections,
        ])->withViewData($metaTags);
    }

    public function seeder()
    {
        ini_set('max_execution_time', 600);

        try {
            Artisan::call('migrate:fresh', ['--force' => true, '--seed' => true]);

            Artisan::call('storage:link');

            Artisan::call('optimize:clear');

            return back()->with('success', 'Installation completed successfully. You can now log in.');
        } catch (\Throwable $th) {
            return back()->with('error', 'Error: '.$th->getMessage());
        }
    }

    /**
     * Generate meta tags array for a page.
     */
    private function generateMetaTags(
        string $title,
        string $description,
        string $image,
        string $type,
        $system,
        ?string $canonicalUrl = null,
    ): array {
        $siteName = $system->fields['name'] ?? 'Mentor Learning Management System';
        $fullTitle = $title === $siteName ? $siteName : $title.' | '.$siteName;

        return [
            'metaTitle' => $fullTitle,
            'metaDescription' => $description,
            'metaKeywords' => $system->fields['keywords'] ?? '',
            'ogTitle' => $title,
            'ogDescription' => $description,
            'ogImage' => $image,
            'ogUrl' => $canonicalUrl ?? request()->url(),
            'ogType' => $type,
            'twitterCard' => 'summary_large_image',
            'twitterTitle' => $title,
            'twitterDescription' => $description,
            'twitterImage' => $image,
            'canonicalUrl' => $canonicalUrl ?? request()->url(),
        ];
    }
}
