<?php

namespace Modules\Service\Http\Requests;

use App\Enums\UserType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ServiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>|string>
     */
    public function rules(): array
    {
        $rules = [
            'title' => ['required', 'string', 'max:255'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'delivery_days' => ['required', 'integer', 'min:1', 'max:365'],
            'status' => ['required', 'string', 'in:draft,published,archived'],
            'technician_id' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where('role', UserType::INSTRUCTOR->value),
            ],
            'thumbnail' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];

        if ($this->isMethod('POST')) {
            $rules['slug'] = ['nullable', 'string', 'max:255', 'unique:services,slug'];
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => __('The service title is required.'),
            'price.required' => __('The service price is required.'),
            'price.min' => __('The service price must be at least zero.'),
            'delivery_days.required' => __('The delivery time is required.'),
        ];
    }
}
