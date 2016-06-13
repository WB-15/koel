<?php

namespace App\Http\Requests\API\ObjectStorage\S3;

use App\Http\Requests\API\ObjectStorage\S3\Request as BaseRequest;

class RemoveSongRequest extends BaseRequest
{
    public function rules()
    {
        return [
            'bucket' => 'required',
            'key' => 'required',
        ];
    }
}
