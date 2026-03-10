CREATE TABLE [dbo].[Transactions]
(
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Name] NVARCHAR(200) NOT NULL,
    [Amount] DECIMAL(18,2) NOT NULL,
    [Type] NVARCHAR(20) NOT NULL,
    [CategoryId] INT NULL,
    [AccountId] INT NULL,
    [ToAccountId] INT NULL,
    [Date] NVARCHAR(10) NOT NULL,
    [MonthKey] NVARCHAR(7) NOT NULL,
    [RecurringId] INT NULL,
    [Status] NVARCHAR(20) NOT NULL,
    [UserId] NVARCHAR(450) NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL,
    [UpdatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PK_Transactions] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_Transactions_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_Transactions_UserId] ON [dbo].[Transactions]([UserId]);
GO

CREATE INDEX [IX_Transactions_UserId_MonthKey] ON [dbo].[Transactions]([UserId], [MonthKey]);
GO
