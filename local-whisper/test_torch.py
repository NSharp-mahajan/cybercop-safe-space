import torch

print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")

if torch.cuda.is_available():
    print(f"CUDA version: {torch.version.cuda}")
    print(f"Number of GPUs: {torch.cuda.device_count()}")
    print(f"GPU name: {torch.cuda.get_device_name(0)}")
else:
    print("CUDA is not available")

# Test a simple tensor operation
x = torch.rand(3, 3)
print(f"\nRandom tensor:\n{x}")

if torch.cuda.is_available():
    x_gpu = x.cuda()
    print(f"\nTensor on GPU: {x_gpu.device}")
