	[bits 64]
	section .data
	hello_start db '$$$', 0x0A
	hello_end db 0
	section .text
	global _start
_start:
	mov rax, 1
	mov rdi, 1
	mov rsi, hello_start
	mov rdx, hello_end - hello_start
	syscall
	mov rax, 60
	xor rdi, rdi
	syscall
