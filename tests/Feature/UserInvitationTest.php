<?php

namespace Tests\Feature;

use App\Mail\UserInvite;
use App\Models\User;
use Illuminate\Support\Str;
use Mail;

class UserInvitationTest extends TestCase
{
    private const JSON_STRUCTURE = ['id', 'name', 'email', 'is_admin'];

    public function testInvite(): void
    {
        Mail::fake();

        /** @var User $admin */
        $admin = User::factory()->admin()->create();

        $this->postAs('api/invitations', [
            'emails' => ['foo@bar.io', 'bar@baz.ai'],
            'is_admin' => true,
        ], $admin)
            ->assertSuccessful()
            ->assertJsonStructure(['*' => self::JSON_STRUCTURE]);

        Mail::assertQueued(UserInvite::class, 2);
    }

    public function testNonAdminCannotInvite(): void
    {
        Mail::fake();

        /** @var User $admin */
        $admin = User::factory()->create();

        $this->postAs('api/invitations', [
            'emails' => ['foo@bar.io', 'bar@baz.ai'],
        ], $admin)
            ->assertForbidden();

        Mail::assertNothingQueued();
    }

    public function testGetProspect(): void
    {
        $prospect = self::createProspect();

        $this->get("api/invitations?token=$prospect->invitation_token")
            ->assertSuccessful()
            ->assertJsonStructure(self::JSON_STRUCTURE);
    }

    public function testRevoke(): void
    {
        /** @var User $admin */
        $admin = User::factory()->admin()->create();

        $prospect = self::createProspect();

        $this->deleteAs('api/invitations', ['email' => $prospect->email], $admin)
            ->assertSuccessful();

        self::assertModelMissing($prospect);
    }

    public function testNonAdminCannotRevoke(): void
    {
        $prospect = self::createProspect();

        $this->deleteAs('api/invitations', ['email' => $prospect->email])
            ->assertForbidden();

        self::assertModelExists($prospect);
    }

    public function testAccept(): void
    {
        $prospect = self::createProspect();

        $this->post('api/invitations/accept', [
            'token' => $prospect->invitation_token,
            'name' => 'Bruce Dickinson',
            'password' => 'SuperSecretPassword',
        ])
            ->assertSuccessful()
            ->assertJsonStructure(['token', 'audio-token']);

        $prospect->refresh();

        self::assertFalse($prospect->is_prospect);
    }

    private static function createProspect(): User
    {
        /** @var User $admin */
        $admin = User::factory()->admin()->create();

        return User::factory()->for($admin, 'invitedBy')->create([
            'invitation_token' => Str::uuid()->toString(),
            'invited_at' => now(),
        ]);
    }
}
