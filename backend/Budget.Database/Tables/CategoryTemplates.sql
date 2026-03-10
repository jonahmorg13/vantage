CREATE TABLE [dbo].[CategoryTemplates]
(
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Name] NVARCHAR(200) NOT NULL,
    [Color] NVARCHAR(50) NOT NULL,
    [DefaultBudgetAmount] DECIMAL(18,2) NOT NULL DEFAULT 0,
    [DefaultSpendLimit] DECIMAL(18,2) NOT NULL DEFAULT 0,
    [SortOrder] INT NOT NULL DEFAULT 0,
    [UserId] NVARCHAR(450) NOT NULL,
    CONSTRAINT [PK_CategoryTemplates] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_CategoryTemplates_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_CategoryTemplates_UserId] ON [dbo].[CategoryTemplates]([UserId]);
GO
