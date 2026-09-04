# Graph Report - app  (2026-08-21)

## Corpus Check
- Corpus is ~30,117 words - fits in a single context window. You may not need a graph.

## Summary
- 1016 nodes · 2136 edges · 82 communities (43 shown, 39 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- S3 Chunked Upload
- User Notifications
- Student & Grading
- SEO Sitemap Generation
- Installer & Bootstrap
- App Configuration
- Job Circular Model
- Instructor Model
- Forum Notifications
- Plugin Manager Service
- Instructor Admin CRUD
- Base Model Scopes
- Page Services
- User Auth Foundation
- Global Helpers TempStore
- Newsletter Management
- Settings Controller
- Mail & PayPal Helpers
- Account Controllers
- Job Circular Controller
- Upload & Job Requests
- Dashboard & Mailing
- Login & Google Auth
- Analytics Event Jobs
- Navbar Footer Models
- Plugin Zip Security
- Plugin Commands Helpers
- Navbar Item Model
- Email Verification Flow
- Password Reset Flow
- Section Content Service
- Profile Update Validation
- Email Change Flow
- Footer Item Model
- Public Subscribe Flow
- Frontend Content Models
- Featured Content Collection
- Base Media Services
- Plugin Registry Security
- Plugin Module Discovery
- Home Front Pages
- Login Validation
- Email Mailables
- Footer Settings Service
- Plugin Package Paths
- Registration Password Rules
- Auth Settings Validation
- Job Circular Queries
- Password Account Requests
- Plugin Packaging Command
- Navbar Item Validation
- Trusted Proxy Middleware
- Instructor Store Validation
- Plugin Install Validation
- SMTP Settings Validation
- Chunk Init Request
- Job Circular Validation
- Verify Email Notification
- Coupon Date Normalization
- Password Rule Concerns
- Intro Customize Middleware
- Page Section Validation
- Instructor Status Validation
- Newsletter Send Validation
- Newsletter Store Validation
- Plugin Toggle Validation
- Custom Page Create Validation
- Custom Page Edit Validation
- Zoom Config Validation
- Meta Pixel Validation
- Instructor Profile Validation
- Storage Settings Validation
- User Update Validation
- Profile Rule Concerns
- Plugin Admin UI
- Google Auth Settings Validation

## God Nodes (most connected - your core abstractions)
1. `User` - 59 edges
2. `SettingsService` - 50 edges
3. `SettingController` - 39 edges
4. `JobCircular` - 37 edges
5. `Instructor` - 35 edges
6. `Setting` - 33 edges
7. `Controller` - 32 edges
8. `ChunkedUpload` - 32 edges
9. `PluginManagerService` - 31 edges
10. `StudentService` - 30 edges

## Surprising Connections (you probably didn't know these)
- `PackagePluginCommand` --references--> `PluginPackagePaths`  [EXTRACTED]
  Console/Commands/PackagePluginCommand.php → Services/Plugins/PluginPackagePaths.php
- `setTempStore()` --calls--> `TempStore`  [EXTRACTED]
  Helpers/Utils.php → Models/TempStore.php
- `getTempStore()` --calls--> `TempStore`  [EXTRACTED]
  Helpers/Utils.php → Models/TempStore.php
- `deleteTempStore()` --calls--> `TempStore`  [EXTRACTED]
  Helpers/Utils.php → Models/TempStore.php
- `HomeController` --references--> `JobCircularService`  [EXTRACTED]
  Http/Controllers/HomeController.php → Services/JobCircularService.php

## Import Cycles
- None detected.

## Communities (82 total, 39 thin omitted)

### Community 0 - "S3 Chunked Upload"
Cohesion: 0.07
Nodes (11): Aws\S3\Exception\S3Exception, Aws\S3\S3Client, ChunkedUploadController, Illuminate\Support\Facades\Http, Illuminate\Support\Facades\Log, Illuminate\Support\Facades\Storage, ChunkedUpload, FileUploadService (+3 more)

### Community 1 - "User Notifications"
Cohesion: 0.08
Nodes (13): NotificationController, HandleInertiaRequests, Illuminate\Support\Facades\App, Illuminate\Support\Facades\Cookie, Inertia\Middleware, Modules\AIAssistant\Services\AIAssistantProviderService, Modules\Frontend\Models\Project, Modules\Language\Models\Language (+5 more)

### Community 2 - "Student & Grading"
Cohesion: 0.10
Nodes (18): calculateGrade(), StudentController, UpdateStudentProfileRequest, Modules\Certification\Services\CertificationService, Modules\Course\Models\CourseAssignment, Modules\Course\Models\CourseCart, Modules\Course\Models\CourseLiveClass, Modules\Course\Models\SectionQuiz (+10 more)

### Community 3 - "SEO Sitemap Generation"
Cohesion: 0.20
Nodes (10): GenerateSitemapCommand, DateTimeInterface, SitemapController, Illuminate\Console\Command, Illuminate\Http\Response, Illuminate\Support\Facades\Cache, SitemapBuilder, Sitemap (+2 more)

### Community 4 - "Installer & Bootstrap"
Cohesion: 0.13
Nodes (11): App\Enums\SystemType, Closure, isInstallerRequest(), EnsureDatabase, HandleAppearance, IpDetectorMiddleware, SystemCollaborative, UserRole (+3 more)

### Community 5 - "App Configuration"
Cohesion: 0.13
Nodes (5): AppConfig, AuthConfig, SmtpConfig, Setting, SettingsService

### Community 7 - "Instructor Model"
Cohesion: 0.12
Nodes (3): Illuminate\Database\Eloquent\Collection, Instructor, InstructorService

### Community 8 - "Forum Notifications"
Cohesion: 0.14
Nodes (7): Illuminate\Bus\Queueable, Illuminate\Notifications\Messages\MailMessage, Illuminate\Notifications\Notification, Illuminate\Support\Facades\URL, ForumNotification, InstructorApprovalNotification, ResetPasswordNotification

### Community 10 - "Instructor Admin CRUD"
Cohesion: 0.11
Nodes (4): InstructorController, UsersController, UpdateInstructorRequest, UserService

### Community 11 - "Base Model Scopes"
Cohesion: 0.11
Nodes (3): Illuminate\Database\Eloquent\Builder, BaseModel, PageSection

### Community 12 - "Page Services"
Cohesion: 0.13
Nodes (3): Page, Modules\Course\Services\CourseService, PageService

### Community 13 - "User Auth Foundation"
Cohesion: 0.16
Nodes (10): Illuminate\Contracts\Auth\MustVerifyEmail, Illuminate\Database\Eloquent\Factories\HasFactory, Illuminate\Database\Eloquent\Relations\HasManyThrough, Illuminate\Foundation\Auth\User, Illuminate\Notifications\DatabaseNotificationCollection, Illuminate\Notifications\Notifiable, PasswordResetToken, User (+2 more)

### Community 14 - "Global Helpers TempStore"
Cohesion: 0.13
Nodes (5): deleteTempStore(), getTempStore(), setTempStore(), Illuminate\Database\Eloquent\Relations\BelongsTo, TempStore

### Community 15 - "Newsletter Management"
Cohesion: 0.15
Nodes (4): NewsletterController, Newsletter, NewsletterNotification, NewsletterService

### Community 17 - "Mail & PayPal Helpers"
Cohesion: 0.14
Nodes (10): Carbon\CarbonImmutable, applicationInstalled(), isDBConnected(), setSmtpConfig(), testSmtpConnection(), Illuminate\Auth\Notifications\ResetPassword, Illuminate\Support\Facades\Date, Illuminate\Support\Facades\Schema (+2 more)

### Community 18 - "Account Controllers"
Cohesion: 0.13
Nodes (5): FooterItemRequest, Illuminate\Support\Facades\Artisan, Illuminate\Support\Facades\Auth, Illuminate\Support\Facades\Route, Inertia\Inertia

### Community 19 - "Job Circular Controller"
Cohesion: 0.19
Nodes (4): ConfirmablePasswordController, JobCircularController, Illuminate\Http\RedirectResponse, Inertia\Response

### Community 20 - "Upload & Job Requests"
Cohesion: 0.15
Nodes (5): ChunkUploadRequest, UpdateLiveClassRequest, UpdateNewsletterRequest, Illuminate\Foundation\Http\FormRequest, Illuminate\Validation\Rule

### Community 21 - "Dashboard & Mailing"
Cohesion: 0.16
Nodes (8): Carbon\Carbon, DashboardController, Illuminate\Support\Facades\Mail, Modules\Billing\Models\PaymentHistory, Modules\Billing\Models\PayoutHistory, Modules\Course\Models\CourseEnrollment, Modules\Course\Models\SectionLesson, DashboardService

### Community 22 - "Login & Google Auth"
Cohesion: 0.15
Nodes (4): AuthenticatedSessionController, GoogleAuthController, RegisteredUserController, AuthService

### Community 23 - "Analytics Event Jobs"
Cohesion: 0.22
Nodes (6): Illuminate\Contracts\Queue\ShouldQueue, Illuminate\Foundation\Bus\Dispatchable, Illuminate\Queue\InteractsWithQueue, SendGoogleAnalyticsEvent, SendMetaCapiEvent, GoogleAnalyticsMeasurementProtocolService

### Community 26 - "Plugin Commands Helpers"
Cohesion: 0.18
Nodes (7): Exception, PluginInstallException, plugin_active(), plugin_enabled(), Illuminate\Support\Str, Nwidart\Modules\Exceptions\ModuleNotFoundException, Nwidart\Modules\Facades\Module

### Community 28 - "Email Verification Flow"
Cohesion: 0.21
Nodes (8): App\Enums\UserType, EmailVerificationPromptController, VerifyEmailController, Controller, Illuminate\Auth\Events\Registered, Illuminate\Auth\Events\Verified, Illuminate\Foundation\Auth\EmailVerificationRequest, Laravel\Socialite\Facades\Socialite

### Community 29 - "Password Reset Flow"
Cohesion: 0.17
Nodes (3): NewPasswordController, PasswordResetLinkController, UpdatePasswordRequest

### Community 31 - "Profile Update Validation"
Cohesion: 0.18
Nodes (4): App\Concerns\ProfileValidationRules, ProfileUpdateRequest, UpdateGoogleAnalyticsRequest, Illuminate\Contracts\Validation\ValidationRule

### Community 32 - "Email Change Flow"
Cohesion: 0.21
Nodes (3): EmailVerificationNotificationController, UpdateEmailRequest, AccountService

### Community 34 - "Public Subscribe Flow"
Cohesion: 0.21
Nodes (3): SubscribeController, StoreSubscribeRequest, Subscribe

### Community 35 - "Frontend Content Models"
Cohesion: 0.27
Nodes (9): Modules\Blog\Models\Blog, Modules\Blog\Models\BlogCategory, Modules\Course\Models\Course, Modules\Course\Models\CourseCategory, Modules\Course\Models\CourseCategoryChild, Modules\Course\Models\CourseSection, Modules\Exam\Models\Exam, Modules\Exam\Models\ExamCategory (+1 more)

### Community 37 - "Base Media Services"
Cohesion: 0.25
Nodes (4): Illuminate\Database\Eloquent\Model, DeviceIp, BaseService, MediaService

### Community 38 - "Plugin Registry Security"
Cohesion: 0.24
Nodes (3): Illuminate\Support\Facades\File, PluginOfficialRegistry, PluginStructureValidator

### Community 39 - "Plugin Module Discovery"
Cohesion: 0.22
Nodes (3): Nwidart\Modules\FileRepository, PluginModuleDiscovery, PluginRegistry

### Community 40 - "Home Front Pages"
Cohesion: 0.24
Nodes (3): HomeController, Modules\Course\Services\CourseCategoryService, Modules\Frontend\Models\ProjectPage

### Community 41 - "Login Validation"
Cohesion: 0.27
Nodes (3): LoginRequest, Illuminate\Auth\Events\Lockout, Illuminate\Support\Facades\RateLimiter

### Community 42 - "Email Mailables"
Cohesion: 0.29
Nodes (5): Illuminate\Mail\Mailable, Illuminate\Mail\Mailables\Content, Illuminate\Mail\Mailables\Envelope, Illuminate\Queue\SerializesModels, ChangeEmailVerification

### Community 45 - "Registration Password Rules"
Cohesion: 0.36
Nodes (5): Illuminate\Auth\Events\PasswordReset, Illuminate\Support\Facades\Hash, Illuminate\Support\Facades\Password, Illuminate\Validation\Rules, Illuminate\Validation\ValidationException

### Community 48 - "Password Account Requests"
Cohesion: 0.38
Nodes (3): App\Concerns\PasswordValidationRules, PasswordUpdateRequest, ProfileDeleteRequest

### Community 73 - "Profile Rule Concerns"
Cohesion: 0.83
Nodes (3): emailRules(), nameRules(), profileRules()

## Knowledge Gaps
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User Auth Foundation` to `Email Change Flow`, `Student & Grading`, `Instructor Model`, `Profile Rule Concerns`, `Instructor Admin CRUD`, `Email Mailables`, `Base Model Scopes`, `Registration Password Rules`, `Intro Customize Middleware`, `Newsletter Management`, `Job Circular Queries`, `Mail & PayPal Helpers`, `Dashboard & Mailing`, `Login & Google Auth`, `Analytics Event Jobs`, `Navbar Footer Models`, `Email Verification Flow`, `Password Reset Flow`?**
  _High betweenness centrality (0.125) - this node is a cross-community bridge._
- **Why does `PluginManagerService` connect `Plugin Manager Service` to `Plugin Module Discovery`, `Plugin Admin UI`, `Plugin Package Paths`, `Plugin Zip Security`, `Plugin Commands Helpers`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `Controller` connect `Email Verification Flow` to `Email Change Flow`, `S3 Chunked Upload`, `User Notifications`, `SEO Sitemap Generation`, `Student & Grading`, `Public Subscribe Flow`, `Home Front Pages`, `Instructor Admin CRUD`, `Plugin Admin UI`, `Registration Password Rules`, `Newsletter Management`, `Settings Controller`, `Account Controllers`, `Job Circular Controller`, `Dashboard & Mailing`, `Login & Google Auth`, `Password Reset Flow`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Should `S3 Chunked Upload` be split into smaller, more focused modules?**
  _Cohesion score 0.06868686868686869 - nodes in this community are weakly interconnected._
- **Should `User Notifications` be split into smaller, more focused modules?**
  _Cohesion score 0.07716701902748414 - nodes in this community are weakly interconnected._
- **Should `Student & Grading` be split into smaller, more focused modules?**
  _Cohesion score 0.1039136302294197 - nodes in this community are weakly interconnected._
- **Should `Installer & Bootstrap` be split into smaller, more focused modules?**
  _Cohesion score 0.1339031339031339 - nodes in this community are weakly interconnected._