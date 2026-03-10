CREATE TABLE [dbo].[Accounts] (
    [Id]             INT            IDENTITY(1,1) NOT NULL,
    [Name]           NVARCHAR(200)  NOT NULL,
    [Color]          NVARCHAR(50)   NOT NULL,
    [AccountType]    NVARCHAR(50)   NOT NULL,
    [InitialBalance] DECIMAL(18,2)  NOT NULL DEFAULT 0,
    [IsDefault]      BIT            NOT NULL DEFAULT 0,
    [UserId]         NVARCHAR(450)  NOT NULL,
    [CreatedAt]      DATETIME2(7)   NOT NULL,
    [UpdatedAt]      DATETIME2(7)   NOT NULL,
    CONSTRAINT [PK_Accounts] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Accounts_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE NONCLUSTERED INDEX [IX_Accounts_UserId]
    ON [dbo].[Accounts]([UserId] ASC);
GO
