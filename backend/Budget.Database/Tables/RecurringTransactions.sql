CREATE TABLE [dbo].[RecurringTransactions]
(
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Name] NVARCHAR(200) NOT NULL,
    [Amount] DECIMAL(18,2) NOT NULL,
    [Type] NVARCHAR(20) NOT NULL,
    [CategoryId] INT NOT NULL,
    [AccountId] INT NULL,
    [DayOfMonth] INT NOT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [UserId] NVARCHAR(450) NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL,
    [UpdatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PK_RecurringTransactions] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_RecurringTransactions_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_RecurringTransactions_UserId] ON [dbo].[RecurringTransactions]([UserId]);
GO
