use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("11111111111111111111111111111111");

#[program]
pub mod pcc_presale {
    use super::*;

    pub fn buy_pcc(ctx: Context<BuyPcc>, amount: u64) -> Result<()> {
        // Transfer Soluna from buyer to owner
        let cpi_accounts = Transfer {
            from: ctx.accounts.buyer_soluna.to_account_info(),
            to: ctx.accounts.owner_soluna.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::transfer(cpi_ctx, amount)?;

        // Calculate PCC to send (1 Soluna = 100 PCC)
        let pcc_amount = amount.checked_mul(100).ok_or(ErrorCode::Overflow)?;

        // Transfer PCC from owner to buyer
        let cpi_accounts_pcc = Transfer {
            from: ctx.accounts.owner_pcc.to_account_info(),
            to: ctx.accounts.buyer_pcc.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        
        let seeds = &[b"owner", &[ctx.bumps.owner]];
        let signer = &[&seeds[..]];
        let cpi_ctx_pcc = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts_pcc,
            signer,
        );
        
        token::transfer(cpi_ctx_pcc, pcc_amount)?;

        msg!("Bought {} PCC for {} Soluna", pcc_amount, amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct BuyPcc<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    /// CHECK: This is the owner account that will receive Soluna
    #[account(mut)]
    pub owner: AccountInfo<'info>,
    
    #[account(
        mut,
        token::mint = soluna_mint,
        token::authority = buyer
    )]
    pub buyer_soluna: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = soluna_mint,
        token::authority = owner
    )]
    pub owner_soluna: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = pcc_mint,
        token::authority = buyer
    )]
    pub buyer_pcc: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = pcc_mint,
        token::authority = owner
    )]
    pub owner_pcc: Account<'info, TokenAccount>,
    
    pub soluna_mint: Account<'info, token::Mint>,
    pub pcc_mint: Account<'info, token::Mint>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Calculation overflow")]
    Overflow,
}
