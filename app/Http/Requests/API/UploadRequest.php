<?php

namespace App\Http\Requests\API;

use App\Http\Requests\AbstractRequest;
use Illuminate\Http\UploadedFile;

/** @property-read UploadedFile $file */
class UploadRequest extends AbstractRequest
{
    public function authorize(): bool
    {
        return auth()->user()->is_admin;
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'mimetypes:audio/mpeg,audio/ogg,audio/x-flac,audio/x-aac'
            ],
        ];
    }
}
