CREATE TABLE [dbo].[RefreshTokens] (
    [Id]        INT            IDENTITY(1,1) NOT NULL,
    [Token]     NVARCHAR(256)  NOT NULL,
    [ExpiresAt] DATETIME2(7)   NOT NULL,
    [CreatedAt] DATETIME2(7)   NOT NULL,
    [IsRevoked] BIT            NOT NULL DEFAULT 0,
    [UserId]    NVARCHAR(450)  NOT NULL,
    CONSTRAINT [PK_RefreshTokens] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_RefreshTokens_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_RefreshTokens_Token]
    ON [dbo].[RefreshTokens]([Token] ASC);
GO

CREATE NONCLUSTERED INDEX [IX_RefreshTokens_UserId]
    ON [dbo].[RefreshTokens]([UserId] ASC);
GO
