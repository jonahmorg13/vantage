CREATE TABLE [dbo].[UserSettings]
(
    [Id] INT IDENTITY(1,1) NOT NULL,
    [DefaultTakeHomePay] DECIMAL(18,2) NOT NULL DEFAULT 0,
    [CurrencySymbol] NVARCHAR(10) NOT NULL DEFAULT '$',
    [UserId] NVARCHAR(450) NOT NULL,
    CONSTRAINT [PK_UserSettings] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_UserSettings_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE
);
GO

CREATE UNIQUE INDEX [IX_UserSettings_UserId] ON [dbo].[UserSettings]([UserId]);
GO
