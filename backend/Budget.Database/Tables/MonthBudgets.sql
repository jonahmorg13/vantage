CREATE TABLE [dbo].[MonthBudgets]
(
    [Id] INT IDENTITY(1,1) NOT NULL,
    [MonthKey] NVARCHAR(7) NOT NULL,
    [TakeHomePay] DECIMAL(18,2) NOT NULL DEFAULT 0,
    [IsLocked] BIT NOT NULL DEFAULT 0,
    [UserId] NVARCHAR(450) NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL,
    [UpdatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PK_MonthBudgets] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_MonthBudgets_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE
);
GO

CREATE UNIQUE INDEX [IX_MonthBudgets_UserId_MonthKey] ON [dbo].[MonthBudgets]([UserId], [MonthKey]);
GO
